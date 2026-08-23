# DERMATHERM

> *Physics-Informed Machine Learning for Coupled Heat and Moisture Transport at the Skin–Textile Interface under Extreme Climatic Conditions*

A research-grade computational framework and scientific dossier studying whether physics-informed
machine learning can model coupled heat and moisture transport at the human skin–textile interface
under extreme climatic conditions.

This repository contains **the dossier and the apparatus on the same page**: a 26-section scientific
analysis plus two live computational machines that run in the browser at render time.

---

## What is inside

### I · The scientific dossier (24 sections + protocol + ledger)

- Executive assessment and **refined research questions** (with explicit non-claims)
- Testable hypotheses, related-work registry and a precisely stated **research gap**
- A critical **audit of the conceptual model** (dimensional analysis, state-variable choice,
  coupling terms, what is omitted and why)
- Full **governing equations** with variables, units and per-equation literature anchors
- Material-parameter tables where every value carries a status flag
  (`SUPPORTED · PARTIALLY SUPPORTED · PROPOSED · ASSUMED · NOT VERIFIED`) and no unsourced number
- Boundary-condition justification, evaporation modelling (Buck saturation + mass-transfer
  coefficient + Lewis relation), and the 2D-heterogeneity scenario design
- PINN formulation: residuals, loss terms, collocation strategy, training protocol, and an honest
  solver / data-only / PINN comparison plan
- Validation strategy, computational experiments **E1–E6**, Wolfram verification plan
- The Firecrawl + Qwen literature-extraction schema, skin-imaging scope boundaries
  (observation ≠ physical model ≠ medical interpretation), limitations **L-01…L-13**
- The **minimum defensible model protocol** (3–4 day plan) and the **claims ledger** that guards
  every statement against overclaiming

### II · Two live computational machines

1. **2D coupled heat–moisture solver** — explicit finite-difference (FTCS) solver on a 56×140 grid
   with heterogeneous textile microstructures (plain weave, porous yarns, seam strip), interfacial
   evaporation, Robin/Dirichlet/Neumann/periodic boundaries, CFL-limited stepping and a live
   conservation audit. Fully interactive: climate forcing, material properties and microstructure.
2. **PINN benchmark** — a genuine physics-informed neural network (2-24-24-1 MLP) trained in the
   browser with hand-rolled forward-mode jets and exact reverse-mode automatic differentiation, on
   the heat equation with a known analytical solution. Compares PINN vs analytical truth vs an
   independent finite-difference reference and reports RMSE, relative L², max error and PDE
   residual norms.

---

## The evidence regime

The project operates under 15 explicit rules, among them:

- Never fabricate a citation, a DOI, an experimental result or a material property
- Always provide units; check dimensional consistency
- Distinguish *measured / reported / derived / assumed / estimated*
- Distinguish thermal comfort from physiological heat stress from medical outcomes
- If two papers disagree, report the disagreement
- Where evidence is lacking: **`INSUFFICIENT EVIDENCE`** — never a confident guess
- Optimize for *defensible*, not *impressive*

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Styling | Tailwind CSS v4 (CSS-first) |
| Equations | KaTeX |
| Numerics | Hand-written TypeScript solvers (no runtime math deps) |
| PINN | Custom MLP + autodiff (forward jets + reverse-mode AD), Adam |

## Project structure

```
src/
├── App.tsx                # shell · scroll-spy navigation · progress rail
├── components/
│   ├── Masthead.tsx       # opening: the computational interface (fig. 0)
│   ├── Simulator.tsx      # live 2D heat–moisture apparatus (§13)
│   ├── PinnBench.tsx      # live PINN benchmark (§14)
│   └── ui.tsx             # KaTeX renderer, chips, section shells, reveals
├── data/
│   ├── dossierA.tsx       # sections 01–12
│   ├── dossierB.tsx       # sections 13–26
│   └── refs.ts            # reference registry (DOI verification rule enforced)
└── lib/
    ├── solver.ts          # 2D FTCS coupled solver
    └── pinn.ts            # PINN trainer + finite-difference reference
```

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # outputs a static site in dist/
```

The app is fully static; `dist/` can be served by any static host (GitHub Pages, Netlify, Vercel…).

---

## Non-claims

DERMATHERM is a computational research prototype. It does not diagnose, treat or predict medical
conditions; it does not score human thermal comfort; it does not certify materials; it reports
simulated behaviour of declared parameters against a numerical reference.

---

*Dossier v0.1 · pre-registration draft*
