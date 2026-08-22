import { useEffect, useState } from "react";
import Masthead from "./components/Masthead";
import { dossierA } from "./data/dossierA";
import { dossierB } from "./data/dossierB";

type NavItem = [string, string, string];
const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "I · Assessment & physics",
    items: [
      ["s01", "01", "Executive assessment"],
      ["s02", "02", "Refined questions"],
      ["s03", "03", "Hypotheses"],
      ["s04", "04", "Related work"],
      ["s05", "05", "Research gap"],
      ["s06", "06", "Model audit"],
      ["s07", "07", "Governing equations"],
      ["s08", "08", "Variables & units"],
      ["s09", "09", "Material parameters"],
      ["s10", "10", "Boundary conditions"],
      ["s11", "11", "Evaporation model"],
      ["s12", "12", "2D heterogeneity"],
    ],
  },
  {
    group: "II · Live apparatus",
    items: [
      ["s13", "13", "Numerical solver"],
      ["s14", "14", "PINN benchmark"],
    ],
  },
  {
    group: "III · ML, validation, evidence",
    items: [
      ["s15", "15", "Loss function"],
      ["s16", "16", "Validation strategy"],
      ["s17", "17", "Experiments E1–E6"],
      ["s18", "18", "Wolfram verification"],
      ["s19", "19", "Evidence database"],
      ["s20", "20", "Limitations L-01…"],
      ["s21", "21", "Contributions"],
      ["s22", "22", "Industrial relevance"],
      ["s23", "23", "Future work"],
      ["s24", "24", "References"],
    ],
  },
  {
    group: "IV · Protocol & ledger",
    items: [
      ["s25", "25", "Minimum model"],
      ["s26", "26", "Claims ledger"],
    ],
  },
];

export default function App() {
  const [active, setActive] = useState("s01");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const ids = NAV.flatMap((g) => g.items.map((i) => i[0]));
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      obs.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <div className="ambient" />

      {/* top bar */}
      <div className="fixed top-0 left-0 right-0 z-40">
        <div className="h-[2.5px] bg-ink3">
          <div
            className="h-full"
            style={{
              width: `${progress * 100}%`,
              background: "linear-gradient(90deg, #3ed6c4, #ff6b3d)",
              transition: "width 0.1s linear",
            }}
          />
        </div>
        <div className="bg-ink/90 backdrop-blur-sm border-b border-line/70">
          <div className="max-w-[1440px] mx-auto px-5 md:px-8 h-12 flex items-center justify-between">
            <a href="#top" className="flex items-center gap-3 group">
              <svg width="26" height="26" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="6" fill="#133039" />
                <path d="M6 22c4-8 8 2 12-6s6-4 8-8" stroke="#ff6b3d" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                <path d="M6 26c4-4 8 0 12-4s6-2 8-6" stroke="#3ed6c4" strokeWidth="2.4" fill="none" strokeLinecap="round" />
              </svg>
              <span className="font-display font-bold tracking-[0.08em] text-paper text-[15px] group-hover:text-heat2 transition-colors">
                DERMATHERM
              </span>
              <span className="hidden md:inline font-mono text-[9.5px] tracking-[0.18em] uppercase text-dim">
                scientific research assistant · dossier
              </span>
            </a>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.16em] uppercase text-aqua2 border border-aqua/30 px-2 py-1 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-aqua blink" />
                solver live
              </span>
              <span className="font-mono text-[9.5px] tracking-[0.16em] uppercase text-muted border border-line px-2 py-1 rounded-sm">
                24 sections + ledger
              </span>
            </div>
          </div>
        </div>
      </div>

      <div id="top" className="relative z-10 max-w-[1440px] mx-auto px-5 md:px-8">
        {/* mobile nav */}
        <nav className="lg:hidden sticky top-12 z-30 -mx-5 px-5 py-2 bg-ink/95 backdrop-blur border-b border-line/60 overflow-x-auto">
          <div className="flex gap-1.5 w-max">
            {NAV.flatMap((g) => g.items).map(([id, no, label]) => (
              <a
                key={id}
                href={`#${id}`}
                className={`font-mono text-[10px] px-2.5 py-1.5 rounded-sm border whitespace-nowrap transition-colors ${
                  active === id
                    ? "border-heat/60 text-heat2 bg-heat/10"
                    : "border-line text-muted hover:text-paper"
                }`}
              >
                {no}
              </a>
            ))}
          </div>
        </nav>

        <Masthead />

        <div className="grid lg:grid-cols-[228px_1fr] gap-10">
          {/* sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-3 pb-10 space-y-5">
              {NAV.map((g) => (
                <div key={g.group}>
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-dim mb-2">{g.group}</p>
                  <ul className="space-y-0.5">
                    {g.items.map(([id, no, label]) => (
                      <li key={id}>
                        <a
                          href={`#${id}`}
                          className={`nav-item flex items-baseline gap-2.5 pl-3 pr-2 py-[5px] rounded-r-sm text-[12.5px] ${
                            active === id ? "active text-heat2 bg-heat/8" : "text-muted hover:text-paper hover:bg-ink2/70"
                          }`}
                        >
                          <span className="font-mono text-[10px] w-5 shrink-0 text-dim">{no}</span>
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="pt-2 border-t border-line/60">
                <p className="font-mono text-[9px] leading-relaxed text-dim">
                  evidence regime: Firecrawl retrieval → Qwen extraction → human approval · Wolfram independent
                  reference · this page computes its own physics.
                </p>
              </div>
            </div>
          </aside>

          {/* main column */}
          <main className="min-w-0 pb-24">
            {dossierA()}
            {dossierB()}

            <footer className="border-t border-line/60 pt-8 mt-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-heat2 mb-2">Division of labour</p>
                  <ul className="text-[12.5px] text-paper/75 space-y-1.5 leading-relaxed">
                    <li><b className="text-paper">Solver</b> — computes the physics.</li>
                    <li><b className="text-paper">PINN</b> — learns a physics-constrained surrogate.</li>
                    <li><b className="text-paper">Qwen</b> — extracts and explains literature; never computes.</li>
                    <li><b className="text-paper">Wolfram</b> — independent numerical referee.</li>
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-aqua2 mb-2">Non-claims</p>
                  <p className="text-[12.5px] text-paper/75 leading-relaxed">
                    DERMATHERM is a computational research prototype. It does not diagnose, treat or predict
                    medical conditions; it does not score human thermal comfort; it does not certify materials;
                    it reports simulated behaviour of declared parameters against a numerical reference.
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim mb-2">Artifact</p>
                  <p className="text-[12.5px] text-paper/75 leading-relaxed">
                    Dossier v0.1 · pre-registration draft · fields in §13–14 are computed in-browser at render
                    time · references flagged per DOI-verification rule (§24).
                  </p>
                </div>
              </div>
              <p className="mt-8 font-mono text-[10px] text-dim tracking-[0.14em] uppercase">
                DERMATHERM — physics-informed ML for the skin–textile interface · optimize for defensible, not impressive
              </p>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
