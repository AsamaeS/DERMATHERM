/* ------------------------------------------------------------------ */
/*  DERMATHERM — PINN benchmark trainer (pure TypeScript)              */
/*  Benchmark: 1D heat equation with known analytical solution         */
/*    du/dt = alpha * d2u/dx2,  x in (0,1), t in (0,1)                 */
/*    u(0,t) = u(1,t) = 0,  u(x,0) = sin(pi x)                         */
/*    u*(x,t) = sin(pi x) * exp(-alpha pi^2 t)                         */
/*  Forward jet propagation (v, vx, vxx, vt) + exact reverse-mode AD   */
/* ------------------------------------------------------------------ */

export interface PinnConfig {
  alpha: number;
  nData: number;
  mode: "pinn" | "data";
}

export interface EpochLog {
  epoch: number;
  Ldata: number;
  Lphys: number;
  Lbc: number;
  Lic: number;
  Ltot: number;
}

export interface EvalResult {
  rmse: number;
  relL2: number;
  maxErr: number;
  resNorm: number; // mean |du/dt - alpha uxx| on test grid
}

const H = 24;
const mulberry = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const truth = (x: number, t: number, a: number) =>
  Math.sin(Math.PI * x) * Math.exp(-a * Math.PI * Math.PI * t);

export class PinnTrainer {
  cfg: PinnConfig;
  // params
  W1 = new Float64Array(H * 2);
  b1 = new Float64Array(H);
  W2 = new Float64Array(H * H);
  b2 = new Float64Array(H);
  W3 = new Float64Array(H);
  b3 = 0;
  // grads
  gW1 = new Float64Array(H * 2);
  gb1 = new Float64Array(H);
  gW2 = new Float64Array(H * H);
  gb2 = new Float64Array(H);
  gW3 = new Float64Array(H);
  gb3 = 0;
  // adam state
  private m: Float64Array[] = [];
  private v: Float64Array[] = [];
  private mB3 = 0;
  private vB3 = 0;
  epoch = 0;
  history: EpochLog[] = [];

  // point sets
  colX!: Float64Array; // Nc x 2
  dataX!: Float64Array;
  dataU!: Float64Array;
  bcX!: Float64Array;
  icX!: Float64Array;
  private Nc = 1300;
  private Nbc = 140;
  private Nic = 160;

  // forward buffers (reused)
  private maxN = 0;
  private pre1!: Float64Array;
  private post1!: Float64Array;
  private pre2!: Float64Array;
  private post2!: Float64Array;
  private out!: Float64Array; // N x 4
  private s2!: Float64Array;
  private sp2!: Float64Array;
  private s1!: Float64Array;
  private sp1!: Float64Array;

  constructor(cfg: PinnConfig) {
    this.cfg = { ...cfg };
    this.sample();
    this.initParams();
    this.alloc();
  }

  private alloc() {
    this.maxN = this.Nc + this.cfg.nData + this.Nbc + this.Nic + 8;
    this.pre1 = new Float64Array(this.maxN * H * 4);
    this.post1 = new Float64Array(this.maxN * H * 4);
    this.pre2 = new Float64Array(this.maxN * H * 4);
    this.post2 = new Float64Array(this.maxN * H * 4);
    this.out = new Float64Array(this.maxN * 4);
    this.s2 = new Float64Array(this.maxN * H * 4);
    this.sp2 = new Float64Array(this.maxN * H * 4);
    this.s1 = new Float64Array(this.maxN * H * 4);
    this.sp1 = new Float64Array(this.maxN * H * 4);
  }

  private sample() {
    const rnd = mulberry(20240517);
    const fill = (n: number, edge: "none" | "bc" | "ic") => {
      const a = new Float64Array(n * 2);
      for (let i = 0; i < n; i++) {
        if (edge === "bc") {
          a[i * 2] = rnd() < 0.5 ? 0 : 1;
          a[i * 2 + 1] = rnd();
        } else if (edge === "ic") {
          a[i * 2] = rnd();
          a[i * 2 + 1] = 0;
        } else {
          a[i * 2] = rnd();
          a[i * 2 + 1] = rnd();
        }
      }
      return a;
    };
    this.colX = fill(this.Nc, "none");
    this.dataX = fill(this.cfg.nData, "none");
    this.dataU = new Float64Array(this.cfg.nData);
    for (let i = 0; i < this.cfg.nData; i++)
      this.dataU[i] = truth(this.dataX[i * 2], this.dataX[i * 2 + 1], this.cfg.alpha);
    this.bcX = fill(this.Nbc, "bc");
    this.icX = fill(this.Nic, "ic");
  }

  private initParams() {
    const rnd = mulberry(424242);
    const xavier = (fanIn: number) => Math.sqrt(6 / (fanIn + H)) * (2 * rnd() - 1);
    for (let i = 0; i < this.W1.length; i++) this.W1[i] = xavier(2);
    for (let i = 0; i < this.W2.length; i++) this.W2[i] = xavier(H);
    for (let i = 0; i < this.W3.length; i++) this.W3[i] = Math.sqrt(6 / (H + 1)) * (2 * rnd() - 1);
    this.m = [this.W1, this.b1, this.W2, this.b2, this.W3].map((p) => new Float64Array(p.length));
    this.v = this.m.map((p) => new Float64Array(p.length));
  }

  /* forward over N points (2-col stride), fills out[N x 4] */
  private forward(pts: Float64Array, N: number) {
    const { W1, b1, W2, b2, W3, b3, pre1, post1, pre2, post2, out } = this;
    for (let p = 0; p < N; p++) {
      const x = pts[p * 2];
      const t = pts[p * 2 + 1];
      const o1 = p * H * 4;
      for (let h = 0; h < H; h++) {
        const wx = W1[h * 2];
        const wt = W1[h * 2 + 1];
        const q = o1 + h * 4;
        pre1[q] = wx * x + wt * t + b1[h];
        pre1[q + 1] = wx;
        pre1[q + 2] = 0;
        pre1[q + 3] = wt;
      }
      this.tanhBlock(pre1, post1, o1);
      const o2 = p * H * 4;
      for (let h = 0; h < H; h++) {
        let a0 = b2[h], a1 = 0, a2 = 0, a3 = 0;
        const row = h * H;
        for (let h2 = 0; h2 < H; h2++) {
          const w = W2[row + h2];
          const q = o1 + h2 * 4;
          a0 += w * post1[q];
          a1 += w * post1[q + 1];
          a2 += w * post1[q + 2];
          a3 += w * post1[q + 3];
        }
        const q = o2 + h * 4;
        pre2[q] = a0;
        pre2[q + 1] = a1;
        pre2[q + 2] = a2;
        pre2[q + 3] = a3;
      }
      this.tanhBlock(pre2, post2, o2);
      let u0 = b3, u1 = 0, u2 = 0, u3 = 0;
      for (let h = 0; h < H; h++) {
        const w = W3[h];
        const q = o2 + h * 4;
        u0 += w * post2[q];
        u1 += w * post2[q + 1];
        u2 += w * post2[q + 2];
        u3 += w * post2[q + 3];
      }
      const oo = p * 4;
      out[oo] = u0;
      out[oo + 1] = u1;
      out[oo + 2] = u2;
      out[oo + 3] = u3;
    }
  }

  private tanhBlock(src: Float64Array, dst: Float64Array, off: number) {
    for (let h = 0; h < H; h++) {
      const q = off + h * 4;
      const y = Math.tanh(src[q]);
      const s = 1 - y * y;
      const ax = src[q + 1];
      const axx = src[q + 2];
      const at = src[q + 3];
      dst[q] = y;
      dst[q + 1] = s * ax;
      dst[q + 2] = s * axx - 2 * y * s * ax * ax;
      dst[q + 3] = s * at;
    }
  }

  /* reverse through tanh block: g = sens on dst jets -> sens on src jets */
  private tanhBack(src: Float64Array, post: Float64Array, off: number, g: Float64Array, out: Float64Array) {
    for (let h = 0; h < H; h++) {
      const q = off + h * 4;
      const y = post[q];
      const s = 1 - y * y;
      const ax = src[q + 1];
      const axx = src[q + 2];
      const at = src[q + 3];
      const g0 = g[q], g1 = g[q + 1], g2 = g[q + 2], g3 = g[q + 3];
      out[q] =
        s * g0 -
        2 * y * s * ax * g1 -
        (2 * y * s * axx + 2 * s * s * ax * ax - 4 * y * y * s * ax * ax) * g2 -
        2 * y * s * at * g3;
      out[q + 1] = s * g1 - 4 * y * s * ax * g2;
      out[q + 2] = s * g2;
      out[q + 3] = s * g3;
    }
  }

  private zeroGrads() {
    this.gW1.fill(0);
    this.gb1.fill(0);
    this.gW2.fill(0);
    this.gb2.fill(0);
    this.gW3.fill(0);
    this.gb3 = 0;
  }

  private backward(N: number, pts: Float64Array, outSens: Float64Array) {
    const { W2, W3, post1, post2, pre2, pre1, s2, sp2, s1, sp1, gW3, gW2, gW1, gb2, gb1 } = this;
    // output linear layer
    for (let p = 0; p < N; p++) {
      const oo = p * 4;
      const g0 = outSens[oo], g1 = outSens[oo + 1], g2 = outSens[oo + 2], g3 = outSens[oo + 3];
      this.gb3 += g0;
      const o2 = p * H * 4;
      for (let h = 0; h < H; h++) {
        const q = o2 + h * 4;
        gW3[h] += g0 * post2[q] + g1 * post2[q + 1] + g2 * post2[q + 2] + g3 * post2[q + 3];
        const w = W3[h];
        s2[q] = w * g0;
        s2[q + 1] = w * g1;
        s2[q + 2] = w * g2;
        s2[q + 3] = w * g3;
      }
    }
    // tanh layer 2
    for (let p = 0; p < N; p++) this.tanhBack(pre2, post2, p * H * 4, s2, sp2);
    // linear layer 2
    for (let p = 0; p < N; p++) {
      const o1 = p * H * 4;
      const o2 = p * H * 4;
      for (let h = 0; h < H; h++) {
        const q2 = o2 + h * 4;
        this.gb2[h] += sp2[q2];
        const row = h * H;
        for (let h2 = 0; h2 < H; h2++) {
          const q1 = o1 + h2 * 4;
          gW2[row + h2] +=
            sp2[q2] * post1[q1] +
            sp2[q2 + 1] * post1[q1 + 1] +
            sp2[q2 + 2] * post1[q1 + 2] +
            sp2[q2 + 3] * post1[q1 + 3];
        }
      }
      for (let h2 = 0; h2 < H; h2++) {
        let c0 = 0, c1 = 0, c2 = 0, c3 = 0;
        for (let h = 0; h < H; h++) {
          const w = W2[h * H + h2];
          const q2 = o2 + h * 4;
          c0 += w * sp2[q2];
          c1 += w * sp2[q2 + 1];
          c2 += w * sp2[q2 + 2];
          c3 += w * sp2[q2 + 3];
        }
        const q1 = o1 + h2 * 4;
        s1[q1] = c0;
        s1[q1 + 1] = c1;
        s1[q1 + 2] = c2;
        s1[q1 + 3] = c3;
      }
    }
    // tanh layer 1
    for (let p = 0; p < N; p++) this.tanhBack(pre1, post1, p * H * 4, s1, sp1);
    // linear layer 1
    for (let p = 0; p < N; p++) {
      const x = pts[p * 2];
      const t = pts[p * 2 + 1];
      const o1 = p * H * 4;
      for (let h = 0; h < H; h++) {
        const q = o1 + h * 4;
        this.gb1[h] += sp1[q];
        this.gW1[h * 2] += sp1[q] * x + sp1[q + 1];
        this.gW1[h * 2 + 1] += sp1[q] * t + sp1[q + 3];
      }
    }
  }

  stepEpoch(): EpochLog {
    const { cfg, Nc, Nbc, Nic } = this;
    const Nd = cfg.nData;
    const N = Nc + Nd + Nbc + Nic;
    const pts = new Float64Array(N * 2);
    pts.set(this.colX, 0);
    pts.set(this.dataX, Nc * 2);
    pts.set(this.bcX, (Nc + Nd) * 2);
    pts.set(this.icX, (Nc + Nd + Nbc) * 2);
    this.forward(pts, N);

    const sens = new Float64Array(N * 4);
    const wPhys = cfg.mode === "pinn" ? 1 : 0;
    let Ldata = 0, Lphys = 0, Lbc = 0, Lic = 0;
    // physics residual on collocation
    if (wPhys > 0) {
      for (let p = 0; p < Nc; p++) {
        const o = p * 4;
        const R = this.out[o + 3] - cfg.alpha * this.out[o + 2];
        Lphys += R * R;
        sens[o + 3] += (2 * R) / Nc;
        sens[o + 2] += (-2 * cfg.alpha * R) / Nc;
      }
      Lphys /= Nc;
    }
    // data
    for (let p = 0; p < Nd; p++) {
      const o = (Nc + p) * 4;
      const e = this.out[o] - this.dataU[p];
      Ldata += e * e;
      sens[o] += (2 * e) / Nd;
    }
    Ldata /= Math.max(Nd, 1);
    // BC
    if (wPhys > 0) {
      for (let p = 0; p < Nbc; p++) {
        const o = (Nc + Nd + p) * 4;
        const u = this.out[o];
        Lbc += u * u;
        sens[o] += (2 * u) / Nbc;
      }
      Lbc /= Nbc;
      // IC
      for (let p = 0; p < Nic; p++) {
        const o = (Nc + Nd + Nbc + p) * 4;
        const e = this.out[o] - Math.sin(Math.PI * this.icX[p * 2]);
        Lic += e * e;
        sens[o] += (2 * e) / Nic;
      }
      Lic /= Nic;
    }
    const Ltot = Ldata + wPhys * (Lphys + Lbc + Lic);

    this.zeroGrads();
    this.backward(N, pts, sens);
    this.adam();
    this.epoch++;
    const log = { epoch: this.epoch, Ldata, Lphys, Lbc, Lic, Ltot };
    this.history.push(log);
    return log;
  }

  private adam(lr = 3e-3) {
    const b1 = 0.9, b2 = 0.999, eps = 1e-8;
    const t = this.epoch + 1;
    const c1 = 1 - b1 ** t, c2 = 1 - b2 ** t;
    const upd = (p: Float64Array, g: Float64Array, m: Float64Array, v: Float64Array) => {
      for (let i = 0; i < p.length; i++) {
        m[i] = b1 * m[i] + (1 - b1) * g[i];
        v[i] = b2 * v[i] + (1 - b2) * g[i] * g[i];
        p[i] -= (lr * m[i]) / c1 / (Math.sqrt(v[i] / c2) + eps);
      }
    };
    upd(this.W1, this.gW1, this.m[0], this.v[0]);
    upd(this.b1, this.gb1, this.m[1], this.v[1]);
    upd(this.W2, this.gW2, this.m[2], this.v[2]);
    upd(this.b2, this.gb2, this.m[3], this.v[3]);
    upd(this.W3, this.gW3, this.m[4], this.v[4]);
    this.mB3 = b1 * this.mB3 + (1 - b1) * this.gb3;
    this.vB3 = b2 * this.vB3 + (1 - b2) * this.gb3 * this.gb3;
    this.b3 -= (lr * this.mB3) / c1 / (Math.sqrt(this.vB3 / c2) + eps);
  }

  evaluate(nx = 41, nt = 41): EvalResult & { u: Float64Array; err: Float64Array; tr: Float64Array } {
    const N = nx * nt;
    const pts = new Float64Array(N * 2);
    let k = 0;
    for (let j = 0; j < nt; j++)
      for (let i = 0; i < nx; i++) {
        pts[k++] = i / (nx - 1);
        pts[k++] = j / (nt - 1);
      }
    if (N + 8 > this.pre1.length / (H * 4)) {
      this.maxN = N + 8;
      this.alloc();
    }
    this.forward(pts, N);
    const u = new Float64Array(N);
    const err = new Float64Array(N);
    const tr = new Float64Array(N);
    let se = 0, st = 0, mx = 0, sr = 0;
    for (let p = 0; p < N; p++) {
      const x = pts[p * 2], t = pts[p * 2 + 1];
      const tv = truth(x, t, this.cfg.alpha);
      const up = this.out[p * 4];
      const R = this.out[p * 4 + 3] - this.cfg.alpha * this.out[p * 4 + 2];
      u[p] = up;
      tr[p] = tv;
      err[p] = up - tv;
      se += (up - tv) ** 2;
      st += tv * tv;
      mx = Math.max(mx, Math.abs(up - tv));
      sr += Math.abs(R);
    }
    return {
      u,
      err,
      tr,
      rmse: Math.sqrt(se / N),
      relL2: Math.sqrt(se / Math.max(st, 1e-12)),
      maxErr: mx,
      resNorm: sr / N,
    };
  }
}

/* ---------------- finite-difference reference ---------------- */
export function fdReference(alpha: number, nx = 201, ntOut = 41) {
  const dx = 1 / (nx - 1);
  const dt = (0.4 * dx * dx) / (2 * alpha);
  let u = new Float64Array(nx);
  let un = new Float64Array(nx);
  for (let i = 0; i < nx; i++) u[i] = Math.sin(Math.PI * i * dx);
  const r = (alpha * dt) / (dx * dx);
  const steps = Math.ceil(1 / dt);
  let snap = 0;
  const snaps: Float64Array[] = [];
  const at = new Float64Array(ntOut);
  for (let s = 1; s <= steps; s++) {
    for (let i = 1; i < nx - 1; i++) un[i] = u[i] + r * (u[i + 1] - 2 * u[i] + u[i - 1]);
    un[0] = 0;
    un[nx - 1] = 0;
    [u, un] = [un, u];
    const tNow = s * dt;
    if (snap < ntOut - 1 && tNow >= (snap + 1) / (ntOut - 1)) {
      snap++;
      snaps[snap] = Float64Array.from(u);
      at[snap] = tNow;
    }
  }
  snaps[0] = Float64Array.from(u.map((_, i) => Math.sin(Math.PI * i * dx)));
  snaps[ntOut - 1] = Float64Array.from(u);
  at[ntOut - 1] = 1;
  return { snaps, at, nx };
}
