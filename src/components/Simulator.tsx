import { useEffect, useRef, useState } from "react";
import {
  DermathermSolver,
  SimParams,
  SimMetrics,
  Scenario,
  NX,
  NY,
  cSat,
  hConv,
  hMass,
  colorFor,
} from "../lib/solver";

type ViewField = "T" | "C" | "k";

const DEFAULTS: SimParams = {
  thicknessMm: 1.2,
  kBase: 0.045,
  DBase: 1.0e-5,
  rho: 400,
  cp: 1300,
  Tskin: 34,
  Tinf: 42,
  RHinf: 85,
  vAir: 0.4,
  sweatGm2h: 50,
  hotspot: true,
  scenario: "weave",
};

const PRESETS: { name: string; p: Partial<SimParams> }[] = [
  { name: "HEATWAVE 42°C · 85%", p: { Tinf: 42, RHinf: 85, vAir: 0.4, sweatGm2h: 55, scenario: "weave", hotspot: true } },
  { name: "DESERT 45°C · 15%", p: { Tinf: 45, RHinf: 15, vAir: 1.6, sweatGm2h: 40, scenario: "homo", hotspot: false } },
  { name: "TEMPERATE 30°C · 50%", p: { Tinf: 30, RHinf: 50, vAir: 0.8, sweatGm2h: 12, scenario: "homo", hotspot: false } },
];

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: "homo", label: "Homogeneous" },
  { id: "weave", label: "Plain weave" },
  { id: "pores", label: "Porous yarns" },
  { id: "seam", label: "Seam strip" },
];

function fmt(x: number, d = 1) {
  return x.toFixed(d);
}

export default function Simulator() {
  const solverRef = useRef<DermathermSolver | null>(null);
  if (!solverRef.current) solverRef.current = new DermathermSolver(DEFAULTS);
  const [params, setParams] = useState<SimParams>(DEFAULTS);
  const [running, setRunning] = useState(true);
  const [view, setView] = useState<ViewField>("T");
  const [metrics, setMetrics] = useState<SimMetrics | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparkTRef = useRef<HTMLCanvasElement>(null);
  const sparkERef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement | null>(null);
  const paramsRef = useRef(params);
  const viewRef = useRef(view);
  const runningRef = useRef(running);
  paramsRef.current = params;
  viewRef.current = view;
  runningRef.current = running;

  /* re-initialise on parameter change */
  useEffect(() => {
    const s = solverRef.current!;
    s.p = { ...params };
    s.rebuild();
  }, [params]);

  /* main animation loop */
  useEffect(() => {
    let raf = 0;
    let frame = 0;
    const loop = () => {
      const s = solverRef.current!;
      if (runningRef.current) {
        s.run(24);
        frame++;
        if (frame % 6 === 0) setMetrics(s.metrics());
      }
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function draw() {
    const s = solverRef.current!;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, Hh = canvas.height;
    const mTop = 30, mBot = 30;

    if (!offRef.current) {
      offRef.current = document.createElement("canvas");
      offRef.current.width = NY;
      offRef.current.height = NX;
    }
    const off = offRef.current;
    const octx = off.getContext("2d")!;
    const img = octx.createImageData(NY, NX);
    const kind = viewRef.current;
    const cMax = cSat(paramsRef.current.Tskin) * 1.1;
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const id = j * NX + i;
        let v: number;
        if (kind === "T") v = (s.T[id] - 24) / (46 - 24);
        else if (kind === "C") v = s.C[id] / cMax;
        else v = (s.k[id] - 0.018) / (0.105 - 0.018);
        v = Math.max(0, Math.min(1, v));
        const [r, g, b] = colorFor(kind, v);
        const px = ((NX - 1 - i) * NY + j) * 4;
        img.data[px] = r;
        img.data[px + 1] = g;
        img.data[px + 2] = b;
        img.data[px + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.fillStyle = "#0b1b21";
    ctx.fillRect(0, 0, W, Hh);
    ctx.drawImage(off, 0, mTop, W, Hh - mTop - mBot);

    /* boundary strips */
    ctx.fillStyle = "rgba(255,107,61,0.14)";
    ctx.fillRect(0, Hh - mBot, W, mBot);
    ctx.fillStyle = "rgba(62,214,196,0.10)";
    ctx.fillRect(0, 0, W, mTop);
    ctx.strokeStyle = "rgba(255,107,61,0.55)";
    ctx.beginPath();
    ctx.moveTo(0, Hh - mBot);
    ctx.lineTo(W, Hh - mBot);
    ctx.stroke();
    ctx.strokeStyle = "rgba(62,214,196,0.45)";
    ctx.beginPath();
    ctx.moveTo(0, mTop);
    ctx.lineTo(W, mTop);
    ctx.stroke();
    ctx.font = "600 10px 'IBM Plex Mono', monospace";
    ctx.fillStyle = "#ffa178";
    ctx.fillText(
      `SKIN · Dirichlet T=${fmt(paramsRef.current.Tskin)}°C · Neumann sweat flux`,
      10,
      Hh - mBot + 19
    );
    ctx.fillStyle = "#9bece1";
    ctx.fillText(
      `AMBIENT · Robin: h=${fmt(hConv(paramsRef.current.vAir))} W/m²K · h_m=${fmt(hMass(hConv(paramsRef.current.vAir)) * 1000, 2)}×10⁻³ m/s`,
      10,
      mTop - 10
    );
    ctx.fillStyle = "#5f7a75";
    ctx.fillText("periodic", W - 62, Hh / 2 - 6);
    ctx.fillText("periodic", W - 62, Hh / 2 + 8);

    drawSparks(s);
  }

  function drawSparks(s: DermathermSolver) {
    const cT = sparkTRef.current;
    const cE = sparkERef.current;
    if (!cT || !cE) return;
    // surface T along y
    const tProf = s.profile(NX - 1, "T");
    const ctxT = cT.getContext("2d")!;
    ctxT.clearRect(0, 0, cT.width, cT.height);
    ctxT.strokeStyle = "#ff6b3d";
    ctxT.lineWidth = 1.6;
    ctxT.beginPath();
    for (let j = 0; j < NY; j++) {
      const x = (j / (NY - 1)) * cT.width;
      const y = cT.height - ((tProf[j] - 24) / (46 - 24)) * cT.height;
      j === 0 ? ctxT.moveTo(x, y) : ctxT.lineTo(x, y);
    }
    ctxT.stroke();
    // evaporation flux along y at skin
    const hm = hMass(hConv(paramsRef.current.vAir));
    const cs = cSat(paramsRef.current.Tskin);
    const ctxE = cE.getContext("2d")!;
    ctxE.clearRect(0, 0, cE.width, cE.height);
    ctxE.strokeStyle = "#3ed6c4";
    ctxE.lineWidth = 1.6;
    ctxE.beginPath();
    const cProf = s.profile(0, "C");
    for (let j = 0; j < NY; j++) {
      const x = (j / (NY - 1)) * cE.width;
      const ev = Math.max(0, hm * (cs - cProf[j])) * 3.6e6; // g/m2h
      const y = cE.height - Math.min(1, ev / 90) * cE.height;
      j === 0 ? ctxE.moveTo(x, y) : ctxE.lineTo(x, y);
    }
    ctxE.stroke();
  }

  const set = (patch: Partial<SimParams>) => setParams((p) => ({ ...p, ...patch }));
  const m = metrics;

  return (
    <div className="grid lg:grid-cols-[1fr_290px] gap-4">
      {/* -------- field view -------- */}
      <div className="bg-ink2/80 border border-line rounded-md p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${running ? "bg-ok tick" : "bg-dim"}`} />
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted">
              {running ? "solver running · explicit FTCS" : "paused"}
            </span>
          </div>
          <div className="flex gap-1.5">
            {(["T", "C", "k"] as ViewField[]).map((f) => (
              <button
                key={f}
                onClick={() => setView(f)}
                className={`font-mono text-[11px] px-3 py-1.5 rounded-sm border transition-colors ${
                  view === f
                    ? "bg-heat/15 border-heat/60 text-heat2"
                    : "border-line text-muted hover:text-paper hover:border-dim"
                }`}
              >
                {f === "T" ? "T(x,y)" : f === "C" ? "C_v(x,y)" : "k(x,y)"}
              </button>
            ))}
          </div>
        </div>

        <canvas ref={canvasRef} width={860} height={430} className="w-full rounded-sm border border-line/70" />

        {/* colour bar */}
        <div className="mt-2 flex items-center gap-3">
          <span className="font-mono text-[10px] text-dim w-24">
            {view === "T" ? "24 °C" : view === "C" ? "0 g/m³" : "0.018 W/mK"}
          </span>
          <div
            className="h-2 flex-1 rounded-full"
            style={{
              background:
                view === "T"
                  ? "linear-gradient(90deg,#123852,#186f7a,#34b09e,#a8cd8d,#f5a05a,#ff6b3d,#e23c2d)"
                  : view === "C"
                  ? "linear-gradient(90deg,#0b202a,#145c68,#2ea89e,#9bece1)"
                  : "linear-gradient(90deg,#1a3d47,#5f7a75,#ffa178)",
            }}
          />
          <span className="font-mono text-[10px] text-dim w-24 text-right">
            {view === "T" ? "46 °C" : view === "C" ? `${fmt(cSat(params.Tskin) * 1100, 0)} g/m³` : "0.105 W/mK"}
          </span>
        </div>

        {/* sparklines */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="border border-line/70 rounded-sm p-2.5 bg-ink/50">
            <p className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-dim mb-1">
              fabric surface T · along y <span className="text-heat2">(skin side → shows 2D structure)</span>
            </p>
            <canvas ref={sparkTRef} width={380} height={52} className="w-full" />
          </div>
          <div className="border border-line/70 rounded-sm p-2.5 bg-ink/50">
            <p className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-dim mb-1">
              evaporation flux J_evap(y) at skin · g/m²h
            </p>
            <canvas ref={sparkERef} width={380} height={52} className="w-full" />
          </div>
        </div>

        {/* metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-4">
          <Stat label="sim time" value={m ? `${fmt(m.tSim, 0)} s` : "—"} />
          <Stat label="Δt (CFL)" value={m ? `${fmt(m.dt, 2)} s` : "—"} />
          <Stat label="evaporation" value={m ? `${fmt(m.evapGm2h)} g/m²h` : "—"} accent="text-aqua2" />
          <Stat label="latent cooling" value={m ? `${fmt(m.latentWm2, 0)} W/m²` : "—"} accent="text-aqua2" />
          <Stat label="surface T range" value={m ? `${fmt(m.TsurfMin)}–${fmt(m.TsurfMax)} °C` : "—"} accent="text-heat2" />
          <Stat
            label="mass balance err"
            value={m ? `${(m.massErrRel * 100).toExponential(1)} %` : "—"}
            accent={m && m.massErrRel < 1e-2 ? "text-ok" : "text-warn"}
          />
        </div>
      </div>

      {/* -------- controls -------- */}
      <div className="space-y-4">
        <div className="bg-ink2/80 border border-line rounded-md p-4">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim mb-3">Textile microstructure</p>
          <div className="grid grid-cols-2 gap-1.5">
            {SCENARIOS.map((sc) => (
              <button
                key={sc.id}
                onClick={() => set({ scenario: sc.id })}
                className={`font-mono text-[10.5px] px-2 py-2 rounded-sm border transition-colors ${
                  params.scenario === sc.id
                    ? "bg-aqua/12 border-aqua/60 text-aqua2"
                    : "border-line text-muted hover:text-paper"
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>
          <label className="flex items-center justify-between mt-3 cursor-pointer group">
            <span className="font-mono text-[10.5px] text-muted group-hover:text-paper transition-colors">
              localised sweat hotspot S(y)
            </span>
            <button
              onClick={() => set({ hotspot: !params.hotspot })}
              className={`w-9 h-5 rounded-full border transition-colors relative ${
                params.hotspot ? "bg-aqua/30 border-aqua/70" : "bg-ink border-line"
              }`}
            >
              <span
                className={`absolute top-[3px] w-3 h-3 rounded-full transition-all ${
                  params.hotspot ? "left-[19px] bg-aqua" : "left-[3px] bg-dim"
                }`}
              />
            </button>
          </label>
        </div>

        <div className="bg-ink2/80 border border-line rounded-md p-4 space-y-3.5">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim">Climate forcing</p>
          <Slider label="ambient T" unit="°C" min={30} max={45} step={0.5} value={params.Tinf} onChange={(v) => set({ Tinf: v })} heat />
          <Slider label="relative humidity" unit="%" min={40} max={90} step={1} value={params.RHinf} onChange={(v) => set({ RHinf: v })} heat />
          <Slider label="air velocity" unit="m/s" min={0} max={3} step={0.1} value={params.vAir} onChange={(v) => set({ vAir: v })} heat />
          <Slider label="sweat supply" unit="g/m²h" min={0} max={80} step={1} value={params.sweatGm2h} onChange={(v) => set({ sweatGm2h: v })} />
          <Slider label="skin temperature" unit="°C" min={32} max={36} step={0.5} value={params.Tskin} onChange={(v) => set({ Tskin: v })} />
        </div>

        <div className="bg-ink2/80 border border-line rounded-md p-4 space-y-3.5">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim">Material properties</p>
          <Slider label="k (thermal cond.)" unit="W/mK" min={0.025} max={0.1} step={0.005} value={params.kBase} onChange={(v) => set({ kBase: v })} />
          <Slider
            label="D_eff (×10⁻⁵ m²/s)"
            unit=""
            min={0.3}
            max={3}
            step={0.1}
            value={params.DBase * 1e5}
            onChange={(v) => set({ DBase: v * 1e-5 })}
          />
          <Slider label="thickness" unit="mm" min={0.5} max={4} step={0.1} value={params.thicknessMm} onChange={(v) => set({ thicknessMm: v })} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setRunning((r) => !r)}
            className={`flex-1 font-mono text-[11px] tracking-[0.14em] uppercase py-2.5 rounded-sm border transition-colors ${
              running
                ? "border-heat/60 text-heat2 bg-heat/10 hover:bg-heat/20"
                : "border-ok/60 text-ok bg-ok/10 hover:bg-ok/20"
            }`}
          >
            {running ? "❚❚ pause" : "▶ run"}
          </button>
          <button
            onClick={() => {
              solverRef.current!.p = { ...paramsRef.current };
              solverRef.current!.rebuild();
            }}
            className="flex-1 font-mono text-[11px] tracking-[0.14em] uppercase py-2.5 rounded-sm border border-line text-muted hover:text-paper hover:border-dim transition-colors"
          >
            ↺ reset
          </button>
        </div>

        <div className="bg-ink2/80 border border-line rounded-md p-4">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim mb-2">Climate presets</p>
          <div className="space-y-1.5">
            {PRESETS.map((pr) => (
              <button
                key={pr.name}
                onClick={() => set(pr.p)}
                className="w-full text-left font-mono text-[10.5px] px-3 py-2 rounded-sm border border-line text-muted hover:text-heat2 hover:border-heat/50 transition-colors"
              >
                {pr.name}
              </button>
            ))}
          </div>
        </div>

        <p className="font-mono text-[9.5px] leading-relaxed text-dim px-1">
          ρ = 400 kg/m³, c_p = 1300 J/kgK (bulk-textile typical values — see §09 status).
          Evaporation: J = h_m·(C_sat(T_skin) − C_v|skin), Buck-form C_sat, h via ISO 9920-type
          correlation, h_m via Lewis relation. Re-initialises on parameter change.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, accent = "text-paper" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="border border-line/70 rounded-sm px-2.5 py-2 bg-ink/50">
      <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-dim">{label}</p>
      <p className={`font-mono text-[13px] font-semibold mt-0.5 ${accent}`}>{value}</p>
    </div>
  );
}

function Slider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  heat = false,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  heat?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="font-mono text-[10.5px] text-muted">{label}</span>
        <span className={`font-mono text-[11px] font-semibold ${heat ? "text-heat2" : "text-aqua2"}`}>
          {value < 10 && step < 1 ? value.toFixed(step < 0.01 ? 3 : step < 0.1 ? 2 : 1) : value.toFixed(step < 1 ? 1 : 0)}
          {unit && <span className="text-dim ml-1">{unit}</span>}
        </span>
      </div>
      <input
        type="range"
        className={`w-full ${heat ? "heat" : ""}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
}
