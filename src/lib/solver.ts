/* ------------------------------------------------------------------ */
/*  DERMATHERM — 2D coupled heat & moisture transport solver           */
/*  Explicit finite differences (FTCS) on Omega = (0,Lx) x (0,Ly)      */
/*  x : skin -> ambient (through textile thickness)                    */
/*  y : lateral (periodic — repeating fabric unit)                     */
/* ------------------------------------------------------------------ */

export type Scenario = "homo" | "weave" | "pores" | "seam";

export interface SimParams {
  thicknessMm: number; // fabric thickness, mm
  kBase: number; // effective thermal conductivity, W/(m K)
  DBase: number; // effective moisture diffusivity, m^2/s
  rho: number; // bulk density, kg/m^3
  cp: number; // specific heat, J/(kg K)
  Tskin: number; // skin temperature, degC (Dirichlet)
  Tinf: number; // ambient temperature, degC
  RHinf: number; // ambient relative humidity, %
  vAir: number; // air velocity, m/s
  sweatGm2h: number; // sweat supply at skin, g/(m^2 h)
  hotspot: boolean; // spatially varying sweat source S(y)
  scenario: Scenario;
}

export const K_AIR = 0.0262; // W/(m K), still air, ~25 degC
export const D_AIR = 2.5e-5; // m^2/s, water vapour in air, ~25 degC
export const LV = 2.426e6; // J/kg latent heat of vaporisation at ~34 degC
export const RHO_CP_AIR = 1.184 * 1006; // J/(m^3 K), ~25 degC
export const LY = 0.02; // lateral domain length, m

export const NX = 56; // cells across thickness
export const NY = 140; // cells lateral

/* Buck (1981) form saturation vapour pressure over liquid water, Pa */
export function pSat(Tc: number): number {
  return 611.21 * Math.exp((18.678 - Tc / 234.5) * (Tc / (257.14 + Tc)));
}
/* vapour concentration at saturation, kg/m^3 (ideal gas, Rv = 461.5) */
export function cSat(Tc: number): number {
  return pSat(Tc) / (461.5 * (Tc + 273.15));
}
/* ISO 9920-type empirical forced convection coefficient, W/(m^2 K) */
export function hConv(v: number): number {
  return Math.max(3.0, 10.45 - v + 10 * Math.sqrt(Math.max(v, 0)));
}
/* Lewis relation (Le ~ 1 for air-water vapour): hm = h / (rho cp)_air */
export function hMass(h: number): number {
  return h / RHO_CP_AIR;
}

export interface SimMetrics {
  tSim: number;
  dt: number;
  steps: number;
  evapGm2h: number; // mean evaporative flux at skin
  latentWm2: number; // evaporative cooling power
  TsurfMin: number;
  TsurfMax: number; // ambient-side fabric surface
  cSurfMean: number; // g/m^3
  massErrRel: number; // conservation check
  steady: boolean;
}

export class DermathermSolver {
  T = new Float64Array(NX * NY);
  C = new Float64Array(NX * NY);
  k = new Float64Array(NX * NY);
  D = new Float64Array(NX * NY);
  sweat = new Float64Array(NY); // kg/(m^2 s) per lateral position
  private Tn = new Float64Array(NX * NY);
  private Cn = new Float64Array(NX * NY);
  p: SimParams;
  dx = 1;
  dy = LY / NY;
  t = 0;
  steps = 0;
  private dt = 0.05;
  private massIn = 0;
  private massOut = 0;
  private mass0 = 0;
  evapAvg = 0;

  constructor(p: SimParams) {
    this.p = { ...p };
    this.rebuild();
  }

  idx(i: number, j: number) {
    return ((j % NY) + NY) % NY * NX + i;
  }

  rebuild() {
    const p = this.p;
    const Lx = p.thicknessMm / 1000;
    this.dx = Lx / NX;
    this.k.fill(p.kBase);
    this.D.fill(p.DBase);

    if (p.scenario === "weave") {
      for (let j = 0; j < NY; j++)
        for (let i = 0; i < NX; i++) {
          const block = (Math.floor(i / 7) + Math.floor(j / 9)) % 2;
          const id = this.idx(i, j);
          this.k[id] *= block ? 1.28 : 0.74;
          this.D[id] *= block ? 0.8 : 1.32;
        }
    } else if (p.scenario === "pores") {
      const pores: [number, number][] = [];
      for (let cj = 8; cj < NY; cj += 18)
        for (let ci = 10; ci < NX - 4; ci += 13)
          pores.push([ci + ((Math.floor(cj / 18) % 2) * 6), cj]);
      const r2 = 5.2 * 5.2;
      for (const [ci, cj] of pores)
        for (let j = Math.max(0, cj - 6); j < Math.min(NY, cj + 6); j++)
          for (let i = Math.max(1, ci - 6); i < Math.min(NX - 1, ci + 6); i++) {
            const d2 = (i - ci) ** 2 + ((j - cj) * (this.dx / this.dy)) ** 2;
            if (d2 < r2) {
              const id = this.idx(i, j);
              this.k[id] = K_AIR;
              this.D[id] = D_AIR;
            }
          }
    } else if (p.scenario === "seam") {
      const j0 = Math.floor(NY * 0.46);
      const j1 = Math.floor(NY * 0.55);
      for (let j = j0; j < j1; j++)
        for (let i = 0; i < NX; i++) {
          const id = this.idx(i, j);
          this.k[id] *= 0.34;
          this.D[id] *= 0.42;
        }
    }

    // sweat supply profile along y
    const J0 = p.sweatGm2h / 3.6e6; // g/(m2 h) -> kg/(m2 s)
    for (let j = 0; j < NY; j++) {
      const y = (j / NY) * LY;
      const g = Math.exp(-((y - LY * 0.5) ** 2) / (2 * (LY * 0.11) ** 2));
      this.sweat[j] = p.hotspot ? J0 * (0.35 + 2.1 * g) : J0;
    }

    // initial fields: linear profiles between skin and ambient
    const Cinf = (p.RHinf / 100) * cSat(p.Tinf);
    const Cskin0 = 0.75 * cSat(p.Tskin);
    for (let j = 0; j < NY; j++)
      for (let i = 0; i < NX; i++) {
        const s = i / (NX - 1);
        this.T[this.idx(i, j)] = p.Tskin + (p.Tinf - p.Tskin) * s;
        this.C[this.idx(i, j)] = Cskin0 + (Cinf - Cskin0) * s;
      }
    this.t = 0;
    this.steps = 0;
    this.massIn = 0;
    this.massOut = 0;
    this.mass0 = this.totalMass();
    this.computeDt();
  }

  private totalMass() {
    let m = 0;
    for (let id = 0; id < this.C.length; id++) m += this.C[id];
    return m * this.dx * this.dy;
  }

  private computeDt() {
    const p = this.p;
    let aMax = 0;
    for (let id = 0; id < NX * NY; id++) {
      const aT = this.k[id] / (p.rho * p.cp);
      if (aT > aMax) aMax = aT;
      if (this.D[id] > aMax) aMax = this.D[id];
    }
    const inv = 1 / this.dx ** 2 + 1 / this.dy ** 2;
    this.dt = 0.32 / (2 * aMax * inv);
    this.dt = Math.min(this.dt, 2.0);
  }

  step() {
    const p = this.p;
    const { T, C, Tn, Cn, k, D, dx, dy } = this;
    const dt = this.dt;
    const h = hConv(p.vAir);
    const hm = hMass(h);
    const Cinf = (p.RHinf / 100) * cSat(p.Tinf);
    const CsatSkin = cSat(p.Tskin);
    const dxi2 = 1 / (dx * dx);
    const dyi2 = 1 / (dy * dy);
    const rhoCp = p.rho * p.cp;
    let evapSum = 0;
    let outFlux = 0;

    for (let j = 0; j < NY; j++) {
      const jm = ((j - 1 + NY) % NY) * NX;
      const j0 = j * NX;
      const jp = ((j + 1) % NY) * NX;
      for (let i = 0; i < NX; i++) {
        const id = j0 + i;
        const Tc = T[id];
        const Cc = C[id];

        /* ---- thermal BC ghosts ---- */
        let Tl: number, Tr: number;
        if (i === 0) Tl = p.Tskin; // Dirichlet skin
        else Tl = T[id - 1];
        if (i === NX - 1) Tr = Tc - ((h * dx) / k[id]) * (Tc - p.Tinf); // Robin
        else Tr = T[id + 1];

        let Cl: number, Cr: number;
        if (i === 0) Cl = Cc + (this.sweat[j] * dx) / D[id]; // Neumann sweat flux
        else Cl = C[id - 1];
        let Cout = 0;
        if (i === NX - 1) {
          Cr = Cc - ((hm * dx) / D[id]) * (Cc - Cinf); // Robin mass
          Cout = hm * (Cc - Cinf);
        } else Cr = C[id + 1];

        /* harmonic face conductivities (robust at air/fibre jumps) */
        const kR = i === NX - 1 ? k[id] : (2 * k[id] * k[id + 1]) / (k[id] + k[id + 1]);
        const kL = i === 0 ? k[id] : (2 * k[id] * k[id - 1]) / (k[id] + k[id - 1]);
        const dR = i === NX - 1 ? D[id] : (2 * D[id] * D[id + 1]) / (D[id] + D[id + 1]);
        const dL = i === 0 ? D[id] : (2 * D[id] * D[id - 1]) / (D[id] + D[id - 1]);
        const kU = (2 * k[id] * k[jp + i]) / (k[id] + k[jp + i]);
        const kDw = (2 * k[id] * k[jm + i]) / (k[id] + k[jm + i]);
        const dU = (2 * D[id] * D[jp + i]) / (D[id] + D[jp + i]);
        const dDw = (2 * D[id] * D[jm + i]) / (D[id] + D[jm + i]);

        const divT =
          (kR * (Tr - Tc) - kL * (Tc - Tl)) * dxi2 +
          (kU * (T[jp + i] - Tc) - kDw * (Tc - T[jm + i])) * dyi2;
        const divC =
          (dR * (Cr - Cc) - dL * (Cc - Cl)) * dxi2 +
          (dU * (C[jp + i] - Cc) - dDw * (Cc - C[jm + i])) * dyi2;

        /* interfacial evaporation/condensation at skin (i = 0) */
        let sEvap = 0;
        if (i === 0) {
          sEvap = (hm * (CsatSkin - Cc)) / dx; // kg/(m^3 s), + = evaporation
          evapSum += hm * (CsatSkin - Cc);
        }
        if (i === NX - 1) outFlux += Cout;

        Tn[id] = Tc + dt * ((divT - LV * sEvap) / rhoCp);
        Cn[id] = Math.max(0, Cc + dt * (divC - sEvap));
      }
    }
    this.T.set(Tn);
    this.C.set(Cn);
    this.t += dt;
    this.steps++;
    this.evapAvg = evapSum / NY;
    this.massIn += this.sweat.reduce((a, b) => a + b, 0) * this.dy * dt;
    this.massOut += outFlux * this.dy * dt;
  }

  run(n: number) {
    for (let s = 0; s < n; s++) this.step();
  }

  metrics(): SimMetrics {
    const p = this.p;
    let tmin = Infinity, tmax = -Infinity, cs = 0;
    for (let j = 0; j < NY; j++) {
      const id = j * NX + (NX - 1);
      const t = this.T[id];
      if (t < tmin) tmin = t;
      if (t > tmax) tmax = t;
      cs += this.C[id];
    }
    const stored = this.totalMass();
    const err = stored - (this.mass0 + this.massIn - this.massOut);
    const denom = Math.max(Math.abs(stored), this.massIn, 1e-9);
    const tau = ((p.thicknessMm / 1000) ** 2) / (p.kBase / (p.rho * p.cp));
    return {
      tSim: this.t,
      dt: this.dt,
      steps: this.steps,
      evapGm2h: this.evapAvg * 3.6e6,
      latentWm2: this.evapAvg * LV,
      TsurfMin: tmin,
      TsurfMax: tmax,
      cSurfMean: (cs / NY) * 1000,
      massErrRel: Math.abs(err) / denom,
      steady: this.t > 5 * tau,
    };
  }

  /* lateral profiles at a given x-index */
  profile(i: number, field: "T" | "C"): Float64Array {
    const out = new Float64Array(NY);
    const F = field === "T" ? this.T : this.C;
    for (let j = 0; j < NY; j++) out[j] = F[j * NX + i];
    return out;
  }
}

/* ---------------- colour maps ---------------- */
export type RGB = [number, number, number];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function ramp(stops: [number, RGB][], t: number): RGB {
  if (t <= stops[0][0]) return stops[0][1];
  for (let s = 0; s < stops.length - 1; s++) {
    const [t0, c0] = stops[s];
    const [t1, c1] = stops[s + 1];
    if (t <= t1) {
      const u = (t - t0) / (t1 - t0);
      return [lerp(c0[0], c1[0], u), lerp(c0[1], c1[1], u), lerp(c0[2], c1[2], u)];
    }
  }
  return stops[stops.length - 1][1];
}
export const T_STOPS: [number, RGB][] = [
  [0.0, [18, 56, 82]],
  [0.32, [24, 111, 122]],
  [0.5, [52, 176, 158]],
  [0.66, [168, 205, 141]],
  [0.8, [245, 160, 90]],
  [0.92, [255, 107, 61]],
  [1.0, [226, 60, 45]],
];
export const C_STOPS: [number, RGB][] = [
  [0.0, [11, 32, 42]],
  [0.45, [20, 92, 104]],
  [0.78, [46, 168, 158]],
  [1.0, [155, 236, 225]],
];
export const K_STOPS: [number, RGB][] = [
  [0.0, [26, 61, 71]],
  [0.5, [95, 122, 117]],
  [1.0, [255, 161, 120]],
];
export function colorFor(kind: "T" | "C" | "k", t: number): RGB {
  return ramp(kind === "T" ? T_STOPS : kind === "C" ? C_STOPS : K_STOPS, t);
}
