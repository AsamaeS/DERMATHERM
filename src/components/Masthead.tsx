import { Eq } from "./ui";

export default function Masthead() {
  return (
    <header className="relative pt-24 md:pt-28 pb-10">
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
        {/* title block */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-6">
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
          <h1 className="font-display font-bold tracking-tight text-[34px] md:text-[52px] leading-[1.04] text-paper">
            Can <span className="text-heat">physics-informed</span>{" "}
            <span className="text-heat">machine&nbsp;learning</span> model coupled heat &amp; moisture transport
            at the <span className="text-aqua">skin–textile interface</span> under extreme climates?
          </h1>
          <p className="mt-6 text-[15.5px] leading-relaxed text-muted max-w-xl">
            <span className="text-paper font-semibold">DERMATHERM</span> is a research-grade framework that
            couples a 2D heat–vapour diffusion solver — with interfacial evaporation — to a physics-informed
            neural surrogate, under a strict evidence regime: no invented parameters, no invented citations,
            no medical claims.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3 max-w-xl">
            {[
              ["domain", "Ω ⊂ ℝ² · 56×140"],
              ["state", "T(x,y,t) · C_v(x,y,t)"],
              ["method", "FTCS ⇄ PINN · AD"],
            ].map(([k, v]) => (
              <div key={k} className="border border-line bg-ink2/70 rounded-md px-3 py-2.5">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-dim">{k}</p>
                <p className="font-mono text-[12px] text-aqua2 mt-1">{v}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 font-mono text-[10px] tracking-[0.14em] uppercase text-dim max-w-xl leading-relaxed">
            rules in force — never fabricate a citation · never fabricate a DOI · units on everything ·
            measured ≠ reported ≠ derived ≠ assumed · comfort ≠ heat stress ≠ medicine
          </p>
        </div>

        {/* characteristic opening: the interface cross-section */}
        <InterfaceDiagram />
      </div>
    </header>
  );
}

function InterfaceDiagram() {
  return (
    <div className="relative bg-ink2/80 border border-line rounded-md p-4 overflow-hidden">
      <div className="flex justify-between items-baseline mb-2">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted">fig. 0 — the computational interface</p>
        <p className="font-mono text-[10px] text-dim">cross-section · x̂ skin→ambient</p>
      </div>
      <svg viewBox="0 0 470 330" className="w-full drift" role="img" aria-label="Skin to textile to ambient cross-section with heat and moisture fluxes">
        {/* ambient */}
        <rect x="0" y="8" width="470" height="72" fill="rgba(62,214,196,0.08)" />
        <text x="12" y="30" fontSize="11" fontFamily="IBM Plex Mono" fill="#9bece1">AMBIENT — T∞ 42°C · RH 85% · v 0.4 m/s</text>
        <text x="12" y="48" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#5f7a75">Robin: −k∇T·n = h(T−T∞) · −D∇C·n = h_m(C−C∞)</text>
        {/* textile */}
        <rect x="0" y="96" width="470" height="128" fill="rgba(19,48,57,0.85)" stroke="#21424c" />
        <text x="12" y="116" fontSize="11" fontFamily="IBM Plex Mono" fill="#e8efec">TEXTILE Ω — k(x,y), D_eff(x,y)</text>
        <text x="12" y="132" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#5f7a75">ρc_p ∂T/∂t = ∇·(k∇T) − L_v·S_evap</text>
        {/* weave pattern */}
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
        {/* pores */}
        {[60, 170, 300, 400].map((cx) => (
          <circle key={cx} cx={cx} cy={182} r={11} fill="#0b1b21" stroke="#21424c" />
        ))}
        {/* microclimate gap */}
        <rect x="0" y="224" width="470" height="26" fill="rgba(62,214,196,0.05)" />
        <text x="12" y="241" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#8fa7a1">MICROCLIMATE GAP — J_evap = h_m(C_sat(T_skin) − C_v)</text>
        {/* skin */}
        <rect x="0" y="250" width="470" height="72" fill="rgba(255,107,61,0.12)" />
        <text x="12" y="274" fontSize="11" fontFamily="IBM Plex Mono" fill="#ffa178">SKIN — T = 34°C (Dirichlet) · −D∇C·n = J_sweat(y)</text>
        <text x="12" y="292" fontSize="9.5" fontFamily="IBM Plex Mono" fill="#5f7a75">sweat supply 0–80 g/m²h · hotspot S(y) optional</text>
        {/* heat flux arrows */}
        {[40, 120, 210, 300, 390].map((x, i) => (
          <line
            key={`h${x}`}
            x1={x + 12}
            y1="252"
            x2={x + 12}
            y2="30"
            stroke="#ff6b3d"
            strokeWidth="2"
            strokeDasharray="7 7"
            className="dash-flow"
            opacity="0.75"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
        {/* moisture flux arrows */}
        {[80, 165, 255, 345, 430].map((x, i) => (
          <line
            key={`m${x}`}
            x1={x}
            y1="300"
            x2={x}
            y2="58"
            stroke="#3ed6c4"
            strokeWidth="2"
            strokeDasharray="3 9"
            className="dash-flow"
            opacity="0.8"
            style={{ animationDelay: `${i * 0.17}s` }}
          />
        ))}
        {/* arrowheads */}
        <defs>
          <marker id="ah" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#ff6b3d" />
          </marker>
          <marker id="am" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#3ed6c4" />
          </marker>
        </defs>
        <line x1="452" y1="120" x2="452" y2="20" stroke="#ff6b3d" strokeWidth="2.4" markerEnd="url(#ah)" />
        <line x1="462" y1="120" x2="462" y2="20" stroke="#3ed6c4" strokeWidth="2.4" markerEnd="url(#am)" />
        <text x="430" y="140" fontSize="8.5" fontFamily="IBM Plex Mono" fill="#ffa178">q</text>
        <text x="456" y="140" fontSize="8.5" fontFamily="IBM Plex Mono" fill="#9bece1">J</text>
        {/* y periodic arrows */}
        <text x="418" y="166" fontSize="9" fontFamily="IBM Plex Mono" fill="#5f7a75">y periodic ⇆</text>
      </svg>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="border border-line/70 rounded-sm px-3 py-2 bg-ink/50">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1">heat residual R_T</p>
          <Eq tex="\rho c_p T_t - \nabla\!\cdot(k\nabla T) + L_v S_{evap} = 0" />
        </div>
        <div className="border border-line/70 rounded-sm px-3 py-2 bg-ink/50">
          <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-dim mb-1">moisture residual R_M</p>
          <Eq tex="C_t - \nabla\!\cdot(D_{eff}\nabla C) - S_{sweat} + S_{evap} = 0" />
        </div>
      </div>
    </div>
  );
}
