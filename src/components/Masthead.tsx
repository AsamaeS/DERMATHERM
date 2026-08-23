import { Eq } from "./ui";

const RULES = [
  "RULE 01 — never fabricate a citation",
  "RULE 02 — never fabricate a DOI",
  "RULE 04 — never fabricate material properties",
  "RULE 06 — always provide units",
  "RULE 07 — check dimensional consistency",
  "RULE 08 — measured ≠ reported ≠ derived ≠ assumed",
  "RULE 10 — comfort ≠ heat stress ≠ medicine",
  "RULE 12 — if two papers disagree, report the disagreement",
  "RULE 15 — optimize for defensible, not impressive",
  "INSUFFICIENT EVIDENCE > a confident guess",
  "Qwen explains · the solver computes · Wolfram referees",
];

export default function Masthead() {
  return (
    <header className="relative pt-24 md:pt-28 pb-0">
      {/* ghost governing equation watermark */}
      <div className="ghost-eq absolute -top-2 -left-6 hidden xl:block text-[92px] leading-none font-display font-bold whitespace-nowrap select-none">
        <Eq tex="\rho c_p\,\partial_t T = \nabla\!\cdot(k\nabla T) - L_v S_{evap}" />
      </div>

      <div className="grid lg:grid-cols-[1.12fr_1fr] gap-10 items-start">
        {/* ---------- title block ---------- */}
        <div className="relative">
          <div className="riser flex flex-wrap items-center gap-2 mb-7" style={{ animationDelay: "0.05s" }}>
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-ink bg-aqua px-2.5 py-1 rounded-sm font-semibold">
              research dossier · v0.1
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted border border-line px-2.5 py-1 rounded-sm">
              computational study — no human subjects
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-heat2 border border-heat/40 px-2.5 py-1 rounded-sm">
              pre-registration draft
            </span>
          </div>

          <h1
            className="riser font-display font-bold tracking-tight text-[36px] md:text-[58px] leading-[1.02] text-paper"
            style={{ animationDelay: "0.14s" }}
          >
            Can <span className="text-heat">physics-informed</span>{" "}
            <span className="text-heat">machine&nbsp;learning</span> model coupled heat &amp; moisture
            transport at the <span className="text-aqua">skin–textile interface</span> under extreme
            climates?
          </h1>

          <p className="riser mt-6 text-[15.5px] leading-relaxed text-muted max-w-xl" style={{ animationDelay: "0.24s" }}>
            <span className="text-paper font-semibold">DERMATHERM</span> couples a 2D heat–vapour diffusion
            solver — with interfacial evaporation — to a physics-informed neural surrogate, under a strict
            evidence regime: no invented parameters, no invented citations, no medical claims. This page
            computes its own physics.
          </p>

          {/* specimen strip */}
          <div
            className="riser mt-9 border border-line bg-ink2/70 rounded-md grid grid-cols-2 md:grid-cols-4 divide-x divide-line/70 overflow-hidden"
            style={{ animationDelay: "0.34s" }}
          >
            {[
              ["domain", "Ω ⊂ ℝ²", "56 × 140 grid"],
              ["state", "T · C_v", "(x, y, t) fields"],
              ["method", "FTCS ⇄ PINN", "autodiff residuals"],
              ["referee", "Wolfram|One", "independent check"],
            ].map(([k, v, sub]) => (
              <div key={k} className="px-4 py-3 group hover:bg-ink3/50 transition-colors">
                <p className="font-mono text-[9px] tracking-[0.22em] uppercase text-dim group-hover:text-aqua transition-colors">
                  {k}
                </p>
                <p className="font-mono text-[13px] font-semibold text-paper mt-1">{v}</p>
                <p className="font-mono text-[9.5px] text-muted mt-0.5">{sub}</p>
              </div>
            ))}
          </div>

          <p
            className="riser mt-7 font-mono text-[10px] tracking-[0.13em] uppercase text-dim max-w-xl leading-relaxed"
            style={{ animationDelay: "0.44s" }}
          >
            evidence regime in force — Firecrawl retrieval → Qwen extraction → human approval · every
            parameter carries a source or a flag · every claim lands in the ledger (§26)
          </p>
        </div>

        {/* ---------- the interface itself ---------- */}
        <div className="riser" style={{ animationDelay: "0.2s" }}>
          <InterfaceDiagram />
        </div>
      </div>

      {/* rules ticker */}
      <div className="riser mt-10 border-y border-line/70 bg-ink2/50 ticker" style={{ animationDelay: "0.5s" }}>
        <div className="ticker-track py-2.5">
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0">
              {RULES.map((r, i) => (
                <span
                  key={`${dup}-${i}`}
                  className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted whitespace-nowrap flex items-center"
                >
                  <span className="mx-5 text-heat">✳</span>
                  {r}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}

function CornerMarks() {
  return (
    <>
      <span className="cf left-1.5 top-1.5 border-l-2 border-t-2" />
      <span className="cf right-1.5 top-1.5 border-r-2 border-t-2" />
      <span className="cf left-1.5 bottom-1.5 border-l-2 border-b-2" />
      <span className="cf right-1.5 bottom-1.5 border-r-2 border-b-2" />
    </>
  );
}

function InterfaceDiagram() {
  return (
    <div className="corner-frame relative bg-ink2/80 border border-line rounded-md p-4 overflow-hidden card-live">
      <CornerMarks />
      <div className="scanline" />

      <div className="flex justify-between items-center mb-2 relative z-10">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">fig. 0 — the computational interface</p>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] uppercase text-aqua2 border border-aqua/30 px-2 py-0.5 rounded-sm bg-ink/60">
          <span className="w-1.5 h-1.5 rounded-full bg-aqua blink" />
          live in §13
        </span>
      </div>

      <svg viewBox="0 0 470 330" className="w-full drift relative z-[1]" role="img" aria-label="Skin to textile to ambient cross-section with heat and moisture fluxes">
        <defs>
          <marker id="ah" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#ff6b3d" />
          </marker>
          <marker id="am" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#3ed6c4" />
          </marker>
        </defs>

        {/* ambient */}
        <rect x="0" y="8" width="470" height="72" fill="rgba(62,214,196,0.08)" />
        <text x="12" y="30" fontSize="11" fontFamily="IBM Plex Mono" fill="#9bece1">AMBIENT — T∞ 42°C · RH 85% · v 0.4 m/s</text>
        <text x="12" y="48" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#5f7a75">Robin: −k∇T·n = h(T−T∞) · −D∇C·n = h_m(C−C∞)</text>

        {/* textile */}
        <rect x="0" y="96" width="470" height="128" fill="rgba(19,48,57,0.85)" stroke="#21424c" />
        <text x="12" y="116" fontSize="11" fontFamily="IBM Plex Mono" fill="#e8efec">TEXTILE Ω — k(x,y), D_eff(x,y)</text>
        <text x="12" y="132" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#5f7a75">ρc_p ∂T/∂t = ∇·(k∇T) − L_v·S_evap</text>
        {Array.from({ length: 9 }).map((_, r) =>
          Array.from({ length: 16 }).map((_, c) => {
            const alt = (r + c) % 2;
            return (
              <rect
                key={`${r}-${c}`}
                x={14 + c * 28}
                y={142 + r * 9}
                width="24"
                height="6"
                rx="1.5"
                fill={alt ? "rgba(255,161,120,0.16)" : "rgba(62,214,196,0.13)"}
              />
            );
          })
        )}
        {[60, 170, 300, 400].map((cx) => (
          <circle key={cx} cx={cx} cy={182} r={11} fill="#0b1b21" stroke="#21424c" />
        ))}

        {/* microclimate */}
        <rect x="0" y="224" width="470" height="26" fill="rgba(62,214,196,0.05)" />
        <text x="12" y="241" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#8fa7a1">MICROCLIMATE GAP — J_evap = h_m(C_sat(T_skin) − C_v)</text>

        {/* skin */}
        <rect x="0" y="250" width="470" height="72" fill="rgba(255,107,61,0.12)" />
        <text x="12" y="274" fontSize="11" fontFamily="IBM Plex Mono" fill="#ffa178">SKIN — T = 34°C (Dirichlet) · −D∇C·n = J_sweat(y)</text>
        <text x="12" y="292" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#5f7a75">sweat supply 0–80 g/m²h · hotspot S(y) optional</text>

        {/* fluxes */}
        {[40, 120, 210, 300, 390].map((x, i) => (
          <line key={`h${x}`} x1={x + 12} y1="252" x2={x + 12} y2="30" stroke="#ff6b3d" strokeWidth="2" strokeDasharray="7 7" className="dash-flow" opacity="0.75" style={{ animationDelay: `${i * 0.12}s` }} />
        ))}
        {[80, 165, 255, 345, 430].map((x, i) => (
          <line key={`m${x}`} x1={x} y1="300" x2={x} y2="58" stroke="#3ed6c4" strokeWidth="2" strokeDasharray="3 9" className="dash-flow" opacity="0.8" style={{ animationDelay: `${i * 0.17}s` }} />
        ))}
        <line x1="452" y1="120" x2="452" y2="20" stroke="#ff6b3d" strokeWidth="2.4" markerEnd="url(#ah)" />
        <line x1="462" y1="120" x2="462" y2="20" stroke="#3ed6c4" strokeWidth="2.4" markerEnd="url(#am)" />
        <text x="430" y="140" fontSize="8.5" fontFamily="IBM Plex Mono" fill="#ffa178">q</text>
        <text x="456" y="140" fontSize="8.5" fontFamily="IBM Plex Mono" fill="#9bece1">J</text>
        <text x="404" y="166" fontSize="9" fontFamily="IBM Plex Mono" fill="#5f7a75">y periodic ⇆</text>
      </svg>

      <div className="mt-2 grid grid-cols-2 gap-2 relative z-10">
        <div className="border border-line/70 rounded-sm px-3 py-2 bg-ink/50 card-live card-heat">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1">heat residual R_T</p>
          <Eq tex="\rho c_p T_t - \nabla\!\cdot(k\nabla T) + L_v S_{evap} = 0" />
        </div>
        <div className="border border-line/70 rounded-sm px-3 py-2 bg-ink/50 card-live">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1">moisture residual R_M</p>
          <Eq tex="C_t - \nabla\!\cdot(D_{eff}\nabla C) - S_{sweat} + S_{evap} = 0" />
        </div>
      </div>
    </div>
  );
}
