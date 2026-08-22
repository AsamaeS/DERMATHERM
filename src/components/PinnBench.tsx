import { useEffect, useRef, useState } from "react";
import { PinnTrainer, PinnConfig, EvalResult, fdReference, truth } from "../lib/pinn";

const TARGET = 2600;

interface FdResult {
  rmse: number;
  relL2: number;
  maxErr: number;
}

export default function PinnBench() {
  const [cfg, setCfg] = useState<PinnConfig>({ alpha: 0.05, nData: 150, mode: "pinn" });
  const [epoch, setEpoch] = useState(0);
  const [phase, setPhase] = useState<"idle" | "train" | "done">("idle");
  const [res, setRes] = useState<EvalResult | null>(null);
  const [fd, setFd] = useState<FdResult | null>(null);
  const [losses, setLosses] = useState<{ ld: number; lp: number; lt: number }>({ ld: 0, lp: 0, lt: 0 });

  const trainerRef = useRef<PinnTrainer | null>(null);
  const lastEvalRef = useRef<(EvalResult & { u: Float64Array; err: Float64Array; tr: Float64Array }) | null>(null);
  const lossC = useRef<HTMLCanvasElement>(null);
  const profC = useRef<HTMLCanvasElement>(null);
  const stripC = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    trainerRef.current = new PinnTrainer(cfg);
    lastEvalRef.current = null;
    setEpoch(0);
    setPhase("idle");
    setRes(null);
    // FD reference error vs analytical truth
    const { snaps, at } = fdReference(cfg.alpha, 201, 41);
    let se = 0, st = 0, mx = 0, n = 0;
    snaps.forEach((u, j) => {
      if (!u) return;
      for (let i = 0; i < u.length; i++) {
        const tv = truth(i / (u.length - 1), at[j], cfg.alpha);
        se += (u[i] - tv) ** 2;
        st += tv * tv;
        mx = Math.max(mx, Math.abs(u[i] - tv));
        n++;
      }
    });
    setFd({ rmse: Math.sqrt(se / n), relL2: Math.sqrt(se / st), maxErr: mx });
    requestAnimationFrame(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg]);

  function train() {
    if (phaseRef.current === "train") return;
    if (trainerRef.current!.epoch >= TARGET) {
      trainerRef.current = new PinnTrainer(cfg);
      lastEvalRef.current = null;
      setEpoch(0);
      setRes(null);
    }
    setPhase("train");
    const loop = () => {
      const tr = trainerRef.current!;
      for (let k = 0; k < 26 && tr.epoch < TARGET; k++) tr.stepEpoch();
      const last = tr.history[tr.history.length - 1];
      if (last) setLosses({ ld: last.Ldata, lp: last.Lphys, lt: last.Ltot });
      if (tr.epoch % 130 === 0 || tr.epoch >= TARGET) {
        lastEvalRef.current = tr.evaluate(61, 61);
        setRes(lastEvalRef.current);
      }
      setEpoch(tr.epoch);
      draw();
      if (tr.epoch < TARGET) requestAnimationFrame(loop);
      else setPhase("done");
    };
    requestAnimationFrame(loop);
  }

  function draw() {
    const tr = trainerRef.current;
    if (!tr) return;
    drawLoss();
    drawProfiles(tr);
    drawStrip();
  }

  function drawLoss() {
    const c = lossC.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(143,167,161,0.15)";
    ctx.font = "9px 'IBM Plex Mono', monospace";
    const yOf = (l: number) => H - 14 - ((Math.log10(Math.max(l, 1e-10)) + 10) / 10) * (H - 26);
    for (let e = 0; e <= 10; e += 2) {
      const y = H - 14 - (e / 10) * (H - 26);
      ctx.beginPath();
      ctx.moveTo(36, y);
      ctx.lineTo(W - 6, y);
      ctx.stroke();
      ctx.fillStyle = "#5f7a75";
      ctx.fillText(`1e-${10 - e}`, 2, y + 3);
    }
    const hist = tr_hist();
    if (hist.length < 2) return;
    const xOf = (i: number) => 36 + (i / (TARGET - 1)) * (W - 44);
    const series = (get: (h: { Ldata: number; Lphys: number }) => number, color: string, dash: number[] = []) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.setLineDash(dash);
      ctx.beginPath();
      hist.forEach((h, i) => {
        const x = xOf(i), y = yOf(get(h));
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    };
    series((h) => h.Ldata, "#3ed6c4");
    series((h) => Math.max(h.Lphys, 1e-10), "#ff6b3d");
    ctx.fillStyle = "#3ed6c4";
    ctx.fillText("L_data", W - 118, 14);
    ctx.fillStyle = "#ff6b3d";
    ctx.fillText("L_physics", W - 66, 14);
  }
  const tr_hist = () => trainerRef.current?.history ?? [];

  function drawProfiles(tr: PinnTrainer) {
    const c = profC.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    const W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(143,167,161,0.12)";
    for (let i = 0; i <= 4; i++) {
      const y = 10 + (i / 4) * (H - 28);
      ctx.beginPath();
      ctx.moveTo(8, y);
      ctx.lineTo(W - 8, y);
      ctx.stroke();
    }
    const N = 80;
    const yOf = (u: number) => H - 18 - u * (H - 30);
    const xOf = (x: number) => 8 + x * (W - 16);
    for (const t of [0.25, 0.6]) {
      // truth
      ctx.strokeStyle = "rgba(232,239,236,0.5)";
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= N; i++) {
        const x = i / N;
        const u = truth(x, t, cfg.alpha);
        i === 0 ? ctx.moveTo(xOf(x), yOf(u)) : ctx.lineTo(xOf(x), yOf(u));
      }
      ctx.stroke();
      ctx.setLineDash([]);
      // prediction
      if (lastEvalRef.current) {
        const ev = lastEvalRef.current;
        const nx = 61;
        ctx.strokeStyle = t === 0.25 ? "#ff6b3d" : "#ffa178";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let i = 0; i < nx; i++) {
          const x = i / (nx - 1);
          const jt = Math.round(t * 60);
          const u = ev.u[jt * nx + i];
          i === 0 ? ctx.moveTo(xOf(x), yOf(u)) : ctx.lineTo(xOf(x), yOf(u));
        }
        ctx.stroke();
      }
      ctx.fillStyle = "#8fa7a1";
      ctx.font = "9px 'IBM Plex Mono', monospace";
      ctx.fillText(`t=${t}`, W - 40, yOf(truth(0.93, t, cfg.alpha)) - 4);
    }
  }

  function drawStrip() {
    const c = stripC.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    const ev = lastEvalRef.current;
    if (!ev) {
      ctx.fillStyle = "#5f7a75";
      ctx.font = "10px 'IBM Plex Mono', monospace";
      ctx.fillText("pointwise error (u_PINN − u_exact) appears during training", 8, c.height / 2);
      return;
    }
    const nx = 61, nt = 61;
    const off = document.createElement("canvas");
    off.width = nx;
    off.height = nt;
    const octx = off.getContext("2d")!;
    const img = octx.createImageData(nx, nt);
    for (let j = 0; j < nt; j++)
      for (let i = 0; i < nx; i++) {
        const e = ev.err[j * nx + i];
        const m = Math.min(1, Math.abs(e) / 0.18);
        const px = ((nt - 1 - j) * nx + i) * 4;
        const base = [13, 34, 43];
        const tgt = e < 0 ? [62, 214, 196] : [255, 107, 61];
        img.data[px] = base[0] + (tgt[0] - base[0]) * m;
        img.data[px + 1] = base[1] + (tgt[1] - base[1]) * m;
        img.data[px + 2] = base[2] + (tgt[2] - base[2]) * m;
        img.data[px + 3] = 255;
      }
    octx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, c.width, c.height);
    ctx.font = "9px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#8fa7a1";
    ctx.fillText("x →", c.width - 34, c.height - 5);
    ctx.fillText("t ↑", 6, 12);
  }

  const set = (patch: Partial<PinnConfig>) => setCfg((c) => ({ ...c, ...patch }));
  const pct = Math.round((epoch / TARGET) * 100);

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-4">
      <div className="bg-ink2/80 border border-line rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
            benchmark: ∂u/∂t = α ∂²u/∂x² · u* = sin(πx)e^(−απ²t) · trained in your browser
          </span>
          <span className={`font-mono text-[10px] px-2 py-1 rounded-sm border ${
            phase === "done" ? "border-ok/50 text-ok" : phase === "train" ? "border-warn/50 text-warn" : "border-line text-dim"
          }`}>
            {phase === "done" ? `converged · ${TARGET} epochs` : phase === "train" ? `training · ${pct}%` : "ready"}
          </span>
        </div>

        <canvas ref={lossC} width={640} height={190} className="w-full border border-line/70 rounded-sm bg-ink/60" />
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div>
            <p className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-dim mb-1.5">
              u(x) profiles — dashed: exact · solid: network
            </p>
            <canvas ref={profC} width={620} height={150} className="w-full border border-line/70 rounded-sm bg-ink/60" />
          </div>
          <div>
            <p className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-dim mb-1.5">
              pointwise error field (x,t) — aqua: under · ember: over
            </p>
            <canvas ref={stripC} width={620} height={150} className="w-full border border-line/70 rounded-sm bg-ink/60" />
          </div>
        </div>

        {/* comparison table */}
        <div className="mt-4 overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>method</th>
                <th>data points</th>
                <th>RMSE vs exact</th>
                <th>rel. L2</th>
                <th>max |err|</th>
                <th>note</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[12px]">
              <tr>
                <td className="text-paper">exact analytical u*</td>
                <td>—</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td className="text-dim">reference by construction</td>
              </tr>
              <tr>
                <td className="text-paper">FD solver (explicit, Nx=201)</td>
                <td>—</td>
                <td>{fd ? fd.rmse.toExponential(2) : "—"}</td>
                <td>{fd ? fd.relL2.toExponential(2) : "—"}</td>
                <td>{fd ? fd.maxErr.toExponential(2) : "—"}</td>
                <td className="text-dim">satisfies discrete equations; O(Δt,Δx²) truncation</td>
              </tr>
              <tr>
                <td className={cfg.mode === "pinn" ? "text-aqua2" : "text-heat2"}>
                  {cfg.mode === "pinn" ? "PINN (data + physics)" : "data-only NN"}
                </td>
                <td>{cfg.nData}</td>
                <td className={res ? "text-paper" : "text-dim"}>{res ? res.rmse.toExponential(2) : "—"}</td>
                <td className={res ? "text-paper" : "text-dim"}>{res ? res.relL2.toExponential(2) : "—"}</td>
                <td className={res ? "text-paper" : "text-dim"}>{res ? res.maxErr.toExponential(2) : "—"}</td>
                <td className="text-dim">{res ? "MLP 2→24→24→1, tanh, Adam" : "train to populate"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* controls */}
      <div className="space-y-4">
        <div className="bg-ink2/80 border border-line rounded-md p-4">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim mb-3">Formulation</p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => set({ mode: "pinn" })}
              className={`font-mono text-[10.5px] px-2 py-2.5 rounded-sm border transition-colors ${
                cfg.mode === "pinn" ? "bg-aqua/12 border-aqua/60 text-aqua2" : "border-line text-muted hover:text-paper"
              }`}
            >
              PINN<br /><span className="text-[9px] opacity-70">λ_phys = 1</span>
            </button>
            <button
              onClick={() => set({ mode: "data" })}
              className={`font-mono text-[10.5px] px-2 py-2.5 rounded-sm border transition-colors ${
                cfg.mode === "data" ? "bg-heat/12 border-heat/60 text-heat2" : "border-line text-muted hover:text-paper"
              }`}
            >
              Data-only<br /><span className="text-[9px] opacity-70">λ_phys = 0</span>
            </button>
          </div>
          <div className="mt-4 space-y-3.5">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-mono text-[10.5px] text-muted">reference data points</span>
                <span className="font-mono text-[11px] font-semibold text-aqua2">{cfg.nData}</span>
              </div>
              <input type="range" min={40} max={600} step={20} value={cfg.nData} onChange={(e) => set({ nData: +e.target.value })} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="font-mono text-[10.5px] text-muted">diffusivity α</span>
                <span className="font-mono text-[11px] font-semibold text-aqua2">{cfg.alpha}</span>
              </div>
              <input type="range" min={0.02} max={0.1} step={0.01} value={cfg.alpha} onChange={(e) => set({ alpha: +e.target.value })} className="w-full" />
            </div>
          </div>
          <p className="font-mono text-[9.5px] text-dim mt-3 leading-relaxed">
            1300 collocation + 140 BC + 160 IC points (fixed, seeded). Collocation points carry NO labels —
            only the PDE residual. Try λ=0 with few data points, then PINN with the same data.
          </p>
        </div>

        <button
          onClick={train}
          disabled={phase === "train"}
          className={`w-full font-mono text-[11px] tracking-[0.16em] uppercase py-3 rounded-sm border transition-colors ${
            phase === "train"
              ? "border-line text-dim cursor-wait"
              : "bg-heat/12 border-heat/60 text-heat2 hover:bg-heat/22"
          }`}
        >
          {phase === "train" ? `training… epoch ${epoch}` : epoch >= TARGET ? "↺ retrain from scratch" : "▶ train network"}
        </button>

        <div className="bg-ink2/80 border border-line rounded-md p-4 space-y-2">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim">Live loss</p>
          <LossRow label="L_data" v={losses.ld} c="text-aqua2" />
          <LossRow label="L_physics" v={cfg.mode === "pinn" ? losses.lp : 0} c="text-heat2" />
          <LossRow label="L_total" v={losses.lt} c="text-paper" />
          <p className="font-mono text-[9.5px] text-dim pt-1 leading-relaxed">
            Derivatives ∂u/∂t, ∂²u/∂x² by exact forward-mode jets + reverse accumulation (automatic
            differentiation) — not finite differences.
          </p>
        </div>

        <div className="bg-ink2/80 border border-line rounded-md p-4">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim mb-2">Reading this experiment</p>
          <p className="text-[12.5px] leading-relaxed text-paper/75">
            The data-only network fits labels where it has them and is unconstrained elsewhere — error
            concentrates away from samples. The PINN pays a slower initial descent but its residual
            <span className="font-mono text-aqua2"> R = u_t − αu_xx </span>
            pins the solution structure. This is the exact comparison planned for the coupled
            (T, C_v) system in §17, Exp. 5.
          </p>
        </div>
      </div>
    </div>
  );
}

function LossRow({ label, v, c }: { label: string; v: number; c: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="font-mono text-[10.5px] text-muted">{label}</span>
      <span className={`font-mono text-[12px] font-semibold ${c}`}>
        {v > 0 ? v.toExponential(2) : "—"}
      </span>
    </div>
  );
}
