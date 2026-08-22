import React from "react";
import { Section, P, Callout, Eq, Chip, Mono, H3, Reveal, Card } from "../components/ui";
import { REFS, refIndex } from "./refs";
import { C } from "./dossierA";
import Simulator from "../components/Simulator";
import PinnBench from "../components/PinnBench";

export function dossierB() {
  return (
    <>
      {/* =============== 13 =============== */}
      <Section id="s13" no="13" kicker="Apparatus A — live" title="Numerical solver (running in your browser)" wide>
        <P>
          This is not a rendering. It is the actual research prototype: an explicit finite-difference solver
          for the coupled system of §07 on a <Mono>56 × 140</Mono> grid, with harmonic-mean face conductivities
          (robust at fibre/air jumps), CFL-limited step
          <Eq tex="\Delta t \le 0.32\,/\,\big(2\,a_{max}(\Delta x^{-2}+\Delta y^{-2})\big)" />,
          periodic lateral boundaries, and a running mass-balance audit. The same configuration will be
          cross-checked against Wolfram NDSolve (§18).
        </P>
        <Simulator />
        <div className="grid md:grid-cols-3 gap-3">
          <Card className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-heat2 mb-2">Verification hooks</p>
            <ul className="text-[13px] text-paper/80 space-y-1.5 list-disc pl-4">
              <li>homogeneous preset ⇒ flat T_surf(y) — live proof of the 1D-degeneracy claim (§12)</li>
              <li>mass-balance error stays &lt; 1% — discrete conservation check</li>
              <li>steady surface flux ↔ apparent R_et conversion planned (§11 note)</li>
            </ul>
          </Card>
          <Card className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-aqua2 mb-2">What to watch</p>
            <ul className="text-[13px] text-paper/80 space-y-1.5 list-disc pl-4">
              <li>raise RH to 90% → evaporation collapses, latent cooling falls — the humidity physics</li>
              <li>switch to porous yarns → cooler channels along pores in the T field</li>
              <li>hotspot on → local cooling crater + lateral vapour spreading in C_v</li>
            </ul>
          </Card>
          <Card className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warn mb-2">Known simplifications here</p>
            <ul className="text-[13px] text-paper/80 space-y-1.5 list-disc pl-4">
              <li>explicit scheme: dt-limited (fine for mm-scale slabs)</li>
              <li>interface layer = one cell (S-04)</li>
              <li>ρ, c_p fixed bulk values (§09 status ASSUMED)</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* =============== 14 =============== */}
      <Section id="s14" no="14" kicker="Apparatus B — live" title="Physics-informed ML model (training live)" wide>
        <P>
          Before trusting a PINN on the coupled system, we verify the implementation where truth is analytic:
          the 1D heat equation with <Eq tex="u^*(x,t)=\sin(\pi x)e^{-\alpha\pi^2 t}" />. The network is a
          2→24→24→1 tanh MLP; derivatives <Eq tex="u_t, u_{xx}" /> are computed by exact forward-mode jets with
          reverse accumulation (automatic differentiation, as required by the PINN formulation<C k="raissi2019" />) —
          never finite differences. The FD column of the table is an independent 201-node explicit solver.
          This is precisely the V1 verification step of §16, executed live.
        </P>
        <PinnBench />
        <Callout tone="info" title="Transfer to the real problem">
          For the coupled 2D system the identical trainer is extended: inputs <Eq tex="(x,y,t)" /> plus condition
          parameters <Eq tex="(T_\infty, RH_\infty, k, D_{eff}, L)" /> (parametric PINN), two output heads
          (T, C_v), and the residuals R_T, R_M of §15. The benchmark proves the AD pipeline, loss bookkeeping
          and metric pipeline before any scientific claim is attached to them.
        </Callout>
      </Section>

      {/* =============== 15 =============== */}
      <Section id="s15" no="15" kicker="Every term defined" title="Loss function">
        <Eq block tex="\mathcal{L}_{total} \;=\; \lambda_d\,\mathcal{L}_{data} + \lambda_T\,\mathcal{L}_{heat} + \lambda_M\,\mathcal{L}_{moisture} + \lambda_b\,\mathcal{L}_{bc} + \lambda_0\,\mathcal{L}_{ic}" />
        <Reveal>
          <div className="space-y-3">
            <Card className="p-4">
              <Eq block tex="\mathcal{L}_{data}=\frac{1}{N_d}\sum_{i=1}^{N_d}\Big[\big(T_\theta(\xi_i)-T_{ref}(\xi_i)\big)^2+\big(C_\theta(\xi_i)-C_{ref}(\xi_i)\big)^2\Big]" />
              <p className="text-[13.5px] text-paper/80">Snapshot data from the numerical solver at collocation locations <Eq tex="\xi_i=(x,y,t)" />. The reference is synthetic — stated every time it is used.</p>
            </Card>
            <Card className="p-4">
              <Eq block tex="\mathcal{L}_{heat}=\frac{1}{N_c}\sum \big[R_T(\xi)\big]^2,\quad R_T=\rho c_p\,\partial_t T_\theta - \nabla\!\cdot(k\nabla T_\theta) + L_v S_{evap}" />
              <Eq block tex="\mathcal{L}_{moisture}=\frac{1}{N_c}\sum \big[R_M(\xi)\big]^2,\quad R_M=\partial_t C_\theta - \nabla\!\cdot(D_{eff}\nabla C_\theta) - S_{sweat}\delta_\Gamma + S_{evap}" />
              <p className="text-[13.5px] text-paper/80">
                Dimensional audit: <Mono>R_T</Mono> in [W·m⁻³], <Mono>R_M</Mono> in [kg·m⁻³·s⁻¹] ✓ (Rule 7). Note the
                magnitudes differ by ~10⁶ — raw equal weights would let <Mono>L_heat</Mono> dominate; see weighting below.
              </p>
            </Card>
            <Card className="p-4">
              <Eq block tex="\mathcal{L}_{bc}=\frac{1}{N_b}\sum_{\Gamma}\big\|\mathcal{B}[T_\theta,C_\theta]-g\big\|^2,\qquad \mathcal{L}_{ic}=\frac{1}{N_0}\sum\big\|u_\theta(x,y,0)-u_0\big\|^2" />
              <p className="text-[13.5px] text-paper/80">BC penalty covers skin Dirichlet/Neumann, ambient Robin (both fields), and periodicity via matched point pairs.</p>
            </Card>
          </div>
        </Reveal>
        <H3>Point sets, AD, normalization, weighting</H3>
        <Reveal>
          <ul className="list-disc pl-5 space-y-2 text-[14px] text-paper/85 max-w-3xl">
            <li><b>Collocation points:</b> uniform Latin-hypercube samples in Ω×[0,t_max]; no labels attached — residual only.</li>
            <li><b>Boundary / IC points:</b> dedicated sets on Γ×[0,t_max] and Ω×&#123;0&#125;; oversampled relative to area because boundary layers carry the physics here.</li>
            <li><b>Automatic differentiation:</b> mandatory — all residual derivatives are exact AD, never numerical (consistency with<C k="raissi2019" />).</li>
            <li><b>Normalization:</b> inputs scaled to [0,1]; outputs standardized by reference-field statistics; residual terms scaled by their initial magnitudes so all λ start O(1).</li>
            <li><b>Weighting:</b> start λ via inverse-magnitude normalization; monitor per-term gradient norms; report sensitivity to λ ± 10×. Adaptive schemes are future work, honestly labelled.</li>
            <li><b>Train / validation / test:</b> 70/15/15 split of solver snapshots by <i>condition</i> (climate–material tuple), not by random points — random-point splits leak spatially and flatter the network.</li>
          </ul>
        </Reveal>
        <H3>The three-way comparison and why it is the scientific core</H3>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[720px]">
              <thead><tr><th>System</th><th>Knows the PDE?</th><th>Needs reference data?</th><th>Role in the study</th></tr></thead>
              <tbody>
                <tr><td className="text-paper">Numerical solver</td><td>by construction</td><td>no</td><td>reference truth (after V1/V2 verification)</td></tr>
                <tr><td className="text-paper">Data-only NN</td><td>no</td><td>yes — all of it</td><td>ablation: isolates the value of physics terms</td></tr>
                <tr><td className="text-aqua2">PINN</td><td>yes (softly)</td><td>yes — fewer</td><td>the claim under test: accuracy per snapshot</td></tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <P>
          Without the data-only ablation, “the PINN works” is an empty statement — any interpolator works with
          enough data. Without the solver, neither network has a ground truth. The triangle is the method<C k="karniadakis2021" />.
        </P>
      </Section>

      {/* =============== 16 =============== */}
      <Section id="s16" no="16" kicker="What counts, what misleads" title="Validation strategy" wide>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[820px]">
              <thead><tr><th>Metric</th><th>Definition</th><th>Verdict</th></tr></thead>
              <tbody>
                {[
                  ["RMSE_T, RMSE_C", "√(N⁻¹Σ(u_pred−u_ref)²) over the test field", "primary — always report with the field's own scale"],
                  ["relative L2", "‖e‖₂/‖u_ref‖₂", "primary — scale-free, comparable across climates"],
                  ["max |err|", "pointwise worst case", "primary for hotspots — mean metrics hide interface errors"],
                  ["R²", "1 − SS_res/SS_tot", "use with caution: near-steady fields make SS_tot small and R² theatrical"],
                  ["physics residual norm", "‖R_T‖, ‖R_M‖ on held-out collocation points", "mandatory — a PINN with low data error and high residual is lying about physics"],
                  ["BC violation", "max |BC residual| on Γ", "mandatory — evaporation flux lives on Γ"],
                  ["conservation error", "|stored − (in − out)| / flux budget", "solver audit; for PINNs becomes a diagnostic of learned fluxes"],
                  ["field-wise error maps", "err(x,y) at fixed t", "mandatory figure — scalar metrics alone conceal structure-locked errors"],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="text-paper">{r[0]}</td>
                    <td className="font-mono text-[12px] text-aqua2/90">{r[1]}</td>
                    <td className={r[2].startsWith("use with caution") ? "text-warn" : ""}>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <H3>Verification chain (order is mandatory)</H3>
        <Reveal>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              ["V1", "analytical benchmark", "1D heat eq. vs u*: solver truncation error quantified; PINN AD pipeline proven — executed live in §14"],
              ["V2", "grid convergence", "solver at Nx×Ny vs 2Nx×2Ny: order ≈ 1 in t, 2 in space as theory requires"],
              ["V3", "PINN vs solver, in-distribution", "metrics above on condition-held-out snapshots"],
              ["V4", "generalization", "train on climate/material envelope A, test on unseen B (§17 Exp. 6)"],
            ].map(([id, t, d]) => (
              <Card key={id} className="p-4">
                <p className="font-display font-bold text-heat text-lg">{id}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-aqua2 mt-1 mb-2">{t}</p>
                <p className="text-[12.5px] text-paper/75 leading-relaxed">{d}</p>
              </Card>
            ))}
          </div>
        </Reveal>
        <Callout tone="critical" title="What validation is NOT available in this study">
          No wet-lab, hotplate, manikin or human data. Every “validation” statement in the paper must read
          “against the numerical reference”. The moment a reviewer sees the word <i>validated</i> attached to
          anything else, the paper dies — pre-empt it.
        </Callout>
      </Section>

      {/* =============== 17 =============== */}
      <Section id="s17" no="17" kicker="Minimal, meaningful, ordered" title="Computational experiments" wide>
        <Reveal>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                n: "E1", t: "Temperature sweep",
                iv: "T_∞: 30→45 °C (1 °C steps)", dv: "steady surface T, J_evap, latent cooling",
                ctl: "RH 60%, v 0.5 m/s, homo fabric",
                trend: "J_evap rises with T_∞ (larger ΔC) until C_v|skin approaches C_sat; latent cooling grows sub-linearly.",
                met: "slope dJ/dT_∞; curve monotonicity", interp: "Sanity gate: non-monotonic response ⇒ solver or closure bug."
              },
              {
                n: "E2", t: "Humidity sweep — the core physics",
                iv: "RH_∞: 40→90%", dv: "J_evap, C_v field, condensation flag",
                ctl: "T_∞ 40 °C fixed",
                trend: "J_evap ≈ linear collapse toward 0 as RH→~95%; surface C_v saturates; at T_∞ > T_skin and RH→90% condensation (J<0) can appear — latent heating.",
                met: "J_evap(RH) curve; sign-flip location", interp: "This is why heat+humidity must be coupled: dry-bulb alone predicts nothing here."
              },
              {
                n: "E3", t: "Material property variation",
                iv: "k ×[0.5, 2], D_eff ×[0.5, 2], L 0.5→4 mm (one at a time)", dv: "ΔT across fabric, J_evap, time constant τ",
                ctl: "heatwave preset",
                trend: "k↑ ⇒ surface T↑, sensible loss↑; D↑ ⇒ J_evap↑; L↑ ⇒ τ ∝ L²/α and steady J↓ (added resistance).",
                met: "sensitivity coefficients ∂J/∂lnk etc.", interp: "Dimensional check: τ scaling with L² verifies the diffusive regime."
              },
              {
                n: "E4", t: "2D heterogeneous textile",
                iv: "scenario ∈ {homo, weave, pores, seam} × hotspot on/off", dv: "CV(J_evap(y)), CV(T_surf(y)), spatial spectrum",
                ctl: "identical climate",
                trend: "homo ⇒ CV ≈ 10⁻³ (1D degeneracy confirmed); weave ⇒ CV 5–25% locked to pattern period; hotspot ⇒ local cooling crater, lateral vapour plume.",
                met: "CV; periodogram peak at weave wavelength", interp: "Falsifies/applies H3; justifies the entire 2D apparatus."
              },
              {
                n: "E5", t: "PINN vs solver vs data-only",
                iv: "formulation ∈ {PINN, data-only}, N_snap ∈ {40…600}", dv: "rel-L2, RMSE, residual norm, BC violation",
                ctl: "fixed architecture, seed, epoch budget",
                trend: "both converge at large N; at N ≤ 150 PINN rel-L2 should be ≥2× lower (H2). Report optimization curves, not just endpoints.",
                met: "full §16 table + loss/gradient traces", interp: "Falsifies/applies H1–H2; the ablation is the contribution."
              },
              {
                n: "E6", t: "Generalization across conditions",
                iv: "training envelope (RH ≤ 60% or k-range A) vs unseen test envelope", dv: "rel-L2 degradation factor",
                ctl: "same training budget",
                trend: "expect degradation at RH 85–90% (evaporation regime change); parametric inputs should halve it.",
                met: "in-dist vs OOD rel-L2 ratio", interp: "Decides whether the surrogate is a lookup or a model; falsifies/applies H4."
              },
            ].map((e) => (
              <Card key={e.n} className="p-5">
                <div className="flex items-baseline justify-between mb-3">
                  <p className="font-display font-bold text-lg text-paper"><span className="text-heat mr-2">{e.n}</span>{e.t}</p>
                </div>
                <dl className="space-y-2 text-[12.5px]">
                  <div className="flex gap-2"><dt className="font-mono text-[10px] text-heat2 w-24 shrink-0 pt-0.5 uppercase">indep. var</dt><dd className="text-paper/85">{e.iv}</dd></div>
                  <div className="flex gap-2"><dt className="font-mono text-[10px] text-aqua2 w-24 shrink-0 pt-0.5 uppercase">dep. var</dt><dd className="text-paper/85">{e.dv}</dd></div>
                  <div className="flex gap-2"><dt className="font-mono text-[10px] text-dim w-24 shrink-0 pt-0.5 uppercase">controls</dt><dd className="text-paper/70">{e.ctl}</dd></div>
                  <div className="flex gap-2"><dt className="font-mono text-[10px] text-warn w-24 shrink-0 pt-0.5 uppercase">expected</dt><dd className="text-paper/85">{e.trend}</dd></div>
                  <div className="flex gap-2"><dt className="font-mono text-[10px] text-dim w-24 shrink-0 pt-0.5 uppercase">metrics</dt><dd className="text-paper/70">{e.met}</dd></div>
                  <div className="flex gap-2"><dt className="font-mono text-[10px] text-dim w-24 shrink-0 pt-0.5 uppercase">reading</dt><dd className="text-paper/70">{e.interp}</dd></div>
                </dl>
              </Card>
            ))}
          </div>
        </Reveal>
        <P>Expected trends are <b>predictions to be checked</b>, not results. If E1–E3 violate them, the solver fails its sanity gate before any ML runs.</P>
      </Section>

      {/* =============== 18 =============== */}
      <Section id="s18" no="18" kicker="Independent referee" title="Wolfram validation strategy">
        <P>
          Wolfram|One serves as an <b>independent implementation</b> of the same PDE system — a second opinion
          that shares no code with our solver. Three uses, in decreasing priority:
        </P>
        <Reveal>
          <ol className="list-decimal pl-5 space-y-3 text-[14px] text-paper/85 max-w-3xl">
            <li>
              <b>Analytical benchmark.</b> Solve <Eq tex="u_t=\alpha u_{xx}" /> with the same IC/BC as §14:
              <Mono>DSolve</Mono> returns <Eq tex="\sin(\pi x)e^{-\alpha\pi^2 t}" /> symbolically — a third,
              independent confirmation of the reference used to grade both our solver and the PINN.
            </li>
            <li>
              <b>2D cross-solve.</b> <Mono>NDSolve</Mono> on the full coupled system for a fixed parameter set;
              compare steady fields against our solver with the §16 metrics. Agreement at &lt;1% relative L2 on
              identical configurations is the pass criterion.
            </li>
            <li>
              <b>Manufactured solutions.</b> Pick a smooth <Eq tex="u^\dagger(x,y,t)" />, compute
              <Eq tex="f=\partial_t u^\dagger-\nabla\!\cdot(D\nabla u^\dagger)" /> analytically, solve the forced
              problem, and verify our discretization reproduces <Eq tex="u^\dagger" /> — catches sign and
              boundary-orientation bugs that symmetric test cases hide.
            </li>
          </ol>
        </Reveal>
        <Card className="p-4">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim mb-2">Wolfram Language sketch (2D moisture, weave patch)</p>
          <pre className="font-mono text-[11.5px] leading-relaxed text-aqua2/90 overflow-x-auto">{`kfun[x_, y_] := If[Mod[Floor[8 x] + Floor[10 y], 2] == 0, 1.2, 0.8]
sol = NDSolve[{D[c[x, y, t], t] == Div[Dfun[x, y] Grad[c[x, y, t], {x, y}], {x, y}]
        + src[x, y],
    c[x, y, 0] == c0[x, y],
    DirichletCondition[...], NeumannValue[...], PeriodicBoundaryCondition[c[x,y,t], x==0,
        TranslationTransform[{1,0}]]},
   c, {x, 0, 1}, {y, 0, 1}, {t, 0, tmax}];
err = NIntegrate[(c[x, y, ts] - cRef[x, y])^2, {x, 0, 1}, {y, 0, 1}]  (* vs our solver export *)`}</pre>
        </Card>
        <Callout tone="info" title="Division of labour">
          Wolfram verifies; it does not replace. Production sweeps and PINN training stay in our pipeline so
          every number in the paper is reproducible from one repository.
        </Callout>
      </Section>

      {/* =============== 19 =============== */}
      <Section id="s19" no="19" kicker="Firecrawl + Qwen pipeline" title="Literature evidence database" wide>
        <P>
          Every parameter that enters the model with a literature claim must pass this pipeline. Firecrawl
          retrieves; Qwen (via the OpenAI-compatible Featherless endpoint) extracts into a fixed schema; a
          human approves. Qwen has exactly three missions — <b>literature extraction, result explanation,
          evidence lookup</b> — and zero authority over the physics: the solver computes, Qwen never does.
        </P>
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-4">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim mb-2">Extraction schema (fixed)</p>
            <pre className="font-mono text-[11px] leading-relaxed text-aqua2/90 overflow-x-auto">{`{
  "paper": "",  "authors": [], "year": "",
  "doi": "",                    // "" => "DOI NOT VERIFIED"
  "material": "", "parameter": "",
  "value": "",  "unit": "",
  "experimental_conditions": "",
  "temperature": "", "relative_humidity": "",
  "textile_structure": "", "thickness": "",
  "measurement_method": "", "uncertainty": "",
  "source_quote": "",           // verbatim, page/fig
  "confidence": "MEASURED|REPORTED|DERIVED|ASSUMED"
}`}</pre>
          </Card>
          <Card className="p-4">
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim mb-2">Extraction laws</p>
            <ul className="text-[13px] text-paper/80 space-y-2">
              <li><span className="text-heat2 font-semibold">L1.</span> If the paper does not explicitly state the value → <Mono>"NOT AVAILABLE"</Mono>. Never interpolate between papers.</li>
              <li><span className="text-heat2 font-semibold">L2.</span> Computed values (e.g. D from R_et via a stated relation) → <Mono>"DERIVED"</Mono> + derivation text.</li>
              <li><span className="text-heat2 font-semibold">L3.</span> <Mono>source_quote</Mono> must be verbatim — the audit trail back to the PDF.</li>
              <li><span className="text-heat2 font-semibold">L4.</span> Disagreement between papers is preserved as separate rows, never merged (Rule 12).</li>
              <li><span className="text-heat2 font-semibold">L5.</span> Model runs may only cite values whose row exists. The parameter file is generated from the database, not hand-edited.</li>
            </ul>
          </Card>
        </div>
        <Callout tone="info" title="Qwen call pattern (engineering note)">
          System prompt: “You are a scientific literature extraction assistant. Never invent numerical material
          properties. Extract only values explicitly supported by the provided source. Return units,
          experimental conditions and citation information.” — called per paper chunk, JSON-only output,
          one human review per merged row.
        </Callout>
      </Section>

      {/* =============== 20 =============== */}
      <Section id="s20" no="20" kicker="Brutal by design" title="Limitations register" wide>
        <P>Each limitation carries an ID so the paper can reference it instead of hand-waving.</P>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[760px]">
              <thead><tr><th>ID</th><th>Limitation</th><th>Consequence</th><th>Severity</th></tr></thead>
              <tbody>
                {[
                  ["L-01", "No liquid sweat phase; sweat enters as vapour flux only", "invalid at sweat rates beyond evaporative capacity (wetted fabric regime)", "HIGH"],
                  ["L-02", "No fibre sorption / bound-water diffusion, no sorption heat", "hygroscopic fibres (wool, cotton) respond faster/slower than simulated at RH steps", "HIGH"],
                  ["L-03", "Constant T_skin — no perfusion, no thermoregulation", "the model cannot warm/cool the skin; all physiology is frozen at the boundary", "HIGH"],
                  ["L-04", "Validation against numerical reference only", "no hotplate, manikin, or human data anywhere in the study", "HIGH (scope)"],
                  ["L-05", "Training data is synthetic (solver-generated)", "PINN accuracy claims inherit solver bias; circularity controlled only by V1/V2", "HIGH"],
                  ["L-06", "ρ, c_p assumed bulk values; k, D ranges handbook-typical", "quantitative flux numbers carry unquantified parameter uncertainty until §19 DB populates them", "MED-HIGH"],
                  ["L-07", "Airflow reduced to h(v) correlation at one boundary", "no wind penetration, no internal advection", "MED"],
                  ["L-08", "Radiative exchange omitted", "under direct solar load the energy balance is incomplete", "MED"],
                  ["L-09", "h(v) correlation transferred from manikin fits to a flat patch", "heat-transfer coefficients are approximate for this geometry", "MED"],
                  ["L-10", "Interface evaporation on a single cell layer", "mesh-dependent regularisation of a surface process", "MED"],
                  ["L-11", "No uncertainty quantification", "single-realisation answers; intervals not yet defensible", "MED"],
                  ["L-12", "PINN optimization pathologies possible", "stiff losses may hide behind small training error", "MED"],
                  ["L-13", "2D patch, flat geometry, periodic sides", "no curvature, no garment fit, no isolated features", "LOW-MED"],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="font-mono text-heat2">{r[0]}</td>
                    <td className="text-paper">{r[1]}</td><td>{r[2]}</td>
                    <td><Chip s={r[3].startsWith("HIGH") ? "ASSUMED" : r[3].startsWith("MED") ? "PARTIALLY SUPPORTED" : "PROPOSED"} small /> <span className="font-mono text-[10px] text-dim ml-1">{r[3]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Callout tone="critical" title="Editorial rule">
          The limitations section is written <b>before</b> the results section in every draft. Reviewers forgive
          a simple model; they never forgive an unaware one.
        </Callout>
      </Section>

      {/* =============== 21 =============== */}
      <Section id="s21" no="21" kicker="Proposed ≠ demonstrated" title="Scientific contributions">
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[720px]">
              <thead><tr><th>Contribution</th><th>Current status</th><th>Becomes “demonstrated” when…</th></tr></thead>
              <tbody>
                {[
                  ["C1 · 2D coupled heat–moisture solver with interfacial evaporation + conservation audit", "PROPOSED", "V1–V2 pass and Wolfram cross-check <1% (§18)"],
                  ["C2 · Heterogeneity scenario set with 1D-degeneracy control and CV metrics", "PROPOSED", "E4 run logged with homogeneous control"],
                  ["C3 · PINN surrogate + data-only ablation on the coupled system", "PROPOSED", "E5 complete with residual/BC diagnostics"],
                  ["C4 · Source-audited parameter evidence schema + extraction pipeline", "PROPOSED", "≥ 20 approved rows with verbatim quotes"],
                  ["C5 · Virtual screening framework (climate × material sweeps)", "PROPOSED", "E1–E3 sweeps reproducible from one script"],
                ].map((r, i) => (
                  <tr key={i}><td className="text-paper">{r[0]}</td><td><Chip s={r[1] as any} small /></td><td>{r[2]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Callout tone="ok" title="Already demonstrated in this artifact">
          Live in-browser execution of the coupled solver with mass-balance audit (§13) · live PINN trainer with
          exact AD verified against an analytical solution (§14) · completed dimensional-consistency audit (§06–§08).
          These are engineering demonstrations of the apparatus, not yet the scientific results of E1–E6.
        </Callout>
      </Section>

      {/* =============== 22 =============== */}
      <Section id="s22" no="22" kicker="B2B relevance, unsold" title="Industrial relevance">
        <P>
          Potential users: textile manufacturers, sportswear R&D, technical-textile and PPE developers,
          material labs, occupational-safety bodies. The defensible value proposition is exactly one sentence:
        </P>
        <Reveal>
          <blockquote className="border-l-2 border-heat pl-4 py-1 text-[16px] text-paper/90 max-w-3xl font-display">
            “Screen candidate climate–material combinations computationally before cutting fabric — rank, don't certify.”
          </blockquote>
        </Reveal>
        <Reveal>
          <ul className="list-disc pl-5 space-y-2 text-[14px] text-paper/85 max-w-3xl">
            <li>What it can reduce, in principle: prototype iterations, hotplate measurement load, development lead time — <b>qualitatively</b>. No monetary figure is stated or invented.</li>
            <li>How economic impact <i>could</i> be evaluated later: instrumented A/B prototyping study with one industrial partner; expert elicitation on screening throughput; cost-per-screen comparison against ISO 11092 campaigns.</li>
            <li>Hard boundaries: the tool ranks <i>simulated</i> behaviour of <i>declared</i> parameters. It does not replace ISO measurement for certification, and it says nothing about dermatological outcomes.</li>
          </ul>
        </Reveal>
      </Section>

      {/* =============== 23 =============== */}
      <Section id="s23" no="23" kicker="Explicitly not implemented" title="Future work">
        <Reveal>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 max-w-4xl">
            {[
              "Physiological thermoregulation coupling (skin energy balance, perfusion)",
              "Multilayer skin model beneath the Dirichlet boundary",
              "Liquid sweat transport (Richards-type) and wetted-fraction states",
              "Fibre sorption isotherms + bound-water diffusion + sorption heat",
              "Pore-scale (micro-CT) geometry with upscaled effective properties",
              "Airflow coupling: wind penetration and intra-textile advection",
              "Radiative exchange and solar loading",
              "Experimental campaign: hotplate R_ct/R_et + guarded conductivity",
              "Wearable sensor streams as boundary-condition priors",
              "Longitudinal skin observation (imaging) as environmental context — strictly observational, §25 note",
              "Material multi-objective optimization under climate ensembles",
              "Climate-adaptive textile concepts driven by sweep results",
              "Full uncertainty quantification (polynomial chaos / ensembles)",
              "Differentiable simulation and inverse material design",
            ].map((t, i) => (
              <div key={i} className="flex gap-3 items-baseline border-b border-line/40 py-2">
                <span className="font-mono text-[10px] text-heat2 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[13.5px] text-paper/85">{t}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <H3>Skin imaging (YouCam) — where it may and may not enter</H3>
        <P>
          Dermatherm may eventually receive image-derived skin descriptors. The only defensible role is as{" "}
          <b>contextual observation</b>, never as model input that drives physics, and never as a basis for
          medical statements. The three layers stay strictly separated:
        </P>
        <Reveal>
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="p-4 border-aqua/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-aqua2 mb-2">① Observation</p>
              <p className="text-[13px] text-paper/80 leading-relaxed">
                Observable, non-diagnostic skin characteristics (e.g. surface redness intensity, shine/sweat
                proxies, texture statistics) recorded over time and environment. Described, not interpreted.
              </p>
            </Card>
            <Card className="p-4 border-heat/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-heat2 mb-2">② Physical model</p>
              <p className="text-[13px] text-paper/80 leading-relaxed">
                The T/C_v solver of §07. Runs on declared climate + material parameters. May <i>later</i> be
                correlated with observation streams — correlation, logged as such, with no causal language.
              </p>
            </Card>
            <Card className="p-4 border-bad/30">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-bad mb-2">③ Medical interpretation</p>
              <p className="text-[13px] text-paper/80 leading-relaxed">
                Forbidden in this project. No disease inference, no textile–dermatology causality, no
                screening claims. Also keep the triad apart: thermal comfort ≠ physiological heat stress ≠
                medical outcome.
              </p>
            </Card>
          </div>
        </Reveal>
      </Section>

      {/* =============== 24 =============== */}
      <Section id="s24" no="24" kicker="Registry — no invented DOIs" title="References" wide>
        <Reveal>
          <ol className="space-y-3">
            {REFS.map((r, i) => (
              <li key={r.key} className="flex gap-4 items-start border-b border-line/40 pb-3">
                <span className="font-mono text-[12px] text-heat2 w-8 shrink-0 pt-0.5">[{i + 1}]</span>
                <div className="flex-1">
                  <p className="text-[14px] text-paper/90">
                    <span className="font-semibold">{r.authors}</span> ({r.year}). {r.title}. <i>{r.venue}</i>.
                  </p>
                  <p className="font-mono text-[11px] text-dim mt-1">
                    {r.doi ? <>DOI {r.doi} · </> : "no DOI · "}
                    {r.doiStatus === "VERIFIED" ? (
                      <Chip s="SUPPORTED" small />
                    ) : r.doiStatus === "NOT VERIFIED" ? (
                      <Chip s="NOT VERIFIED" small />
                    ) : (
                      <span className="uppercase tracking-wider text-[10px]">standard / book</span>
                    )}
                    <span className="ml-3 text-aqua2/80">{r.tag}</span>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
        <Callout tone="warn" title="Registry discipline">
          Entries flagged <Chip s="NOT VERIFIED" small /> are recalled from the assistant's training and must be
          confirmed through the §19 pipeline (or the publisher page) before manuscript submission. Removal of an
          unsupported entry is always preferable to a retraction note.
        </Callout>
      </Section>

      {/* =============== 25 — minimum model =============== */}
      <Section id="s25" no="25" kicker="The 3–4 day protocol" title="The minimum scientific model we should implement">
        <P>
          Smallest defensible unit: one coupled system, one heterogeneity story, one verification chain.
          Everything else in this dossier is either already-audited context or explicitly deferred.
        </P>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            ["Domain & grid", "Ω = (0, L_x)×(0, L_y), L_x ∈ [0.5, 4] mm, L_y = 20 mm, 56×140 cells, periodic in y."],
            ["State variables", "T(x,y,t) [°C], C_v(x,y,t) [kg·m⁻³]. Derived: J_evap(y,t), L_v·J_evap, apparent R_et."],
            ["Equations", "ρc_p ∂_tT = ∇·(k∇T) − L_v S_evap · ∂_tC_v = ∇·(D_eff∇C_v) − S_evap, with sweat as Neumann BC and S_evap confined to the interface layer (§07)."],
            ["Parameters", "k, D_eff from §09 slider bounds until the evidence DB populates them (ASSUMED status declared); ρ=400, c_p=1300 (ASSUMED); L_v=2.426×10⁶ (SUPPORTED); C_sat via Buck (SUPPORTED); h via ISO-type (SUPPORTED); h_m via Lewis (SUPPORTED)."],
            ["Boundary / initial", "Skin: T=34 °C, −D∂_nC_v=J_sweat(y). Ambient: Robin h, h_m. Lateral: periodic. IC: linear profiles."],
            ["Numerics", "Explicit FTCS, harmonic faces, CFL Δt, mass-balance audit (<1% pass)."],
            ["Validation experiments", "V1 analytical 1D benchmark · V2 grid convergence · sanity gates E1–E3 · E4 heterogeneity vs homogeneous control."],
            ["PINN formulation", "MLP, AD derivatives, loss of §15 with inverse-magnitude λ; benchmark trainer (§14) ported to the coupled residuals."],
            ["Evaluation metrics", "rel-L2, RMSE, max|err|, residual norm, BC violation, CV(J_evap) — §16. R² reported, not celebrated."],
            ["Required sources", "refs [4,5,9,12,17,18] for equations/constants (VERIFIED); [8,10] for model precedent (NOT VERIFIED → verify); §19 pipeline for every material number."],
          ].map(([t, d], i) => (
            <Card key={t} className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-aqua2 mb-2">{t}</p>
              <p className="text-[13px] text-paper/80 leading-relaxed">{d}</p>
            </Card>
          ))}
        </div>
        <Callout tone="ok" title="Definition of done">
          The study is complete when: the ledger below has no row whose evidence is missing, E1–E6 logs are in
          the repository, and every figure caption states what reference it compares against.
        </Callout>
      </Section>

      {/* =============== 26 — ledger =============== */}
      <Section id="s26" no="26" kicker="Overclaim prevention" title="Claims ledger" wide>
        <P>
          Every claim the paper or presentation makes must appear here with its required evidence. Statuses
          follow the project rules: <Chip s="SUPPORTED" small /> <Chip s="PARTIALLY SUPPORTED" small />{" "}
          <Chip s="PROPOSED" small /> <Chip s="ASSUMED" small /> <Chip s="NOT VERIFIED" small />.
        </P>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[860px]">
              <thead><tr><th>Claim</th><th>Evidence required</th><th>Source</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  ["Governing system: Fourier + Fick + interfacial latent coupling", "classical coupled-transport theory + dimensional audit", "[4][5][9][18] + §06 audit", "SUPPORTED"],
                  ["C_sat(T) via Buck equation", "published physical chemistry", "[17]", "SUPPORTED"],
                  ["h(v) = 10.45 − v + 10√v usable at ambient BC", "clothing-standard empirical correlation", "[12]", "SUPPORTED"],
                  ["h_m from Lewis relation with Le ≈ 1", "standard transport theory", "[18]", "SUPPORTED"],
                  ["L_v = 2.426×10⁶ J/kg at 34 °C", "steam tables", "standard reference", "SUPPORTED"],
                  ["PINN formulation with AD residuals is sound", "framework literature + live benchmark §14", "[1][2][3] + artifact", "SUPPORTED"],
                  ["Homogeneous slab ⇒ 1D degeneracy", "mathematical fact + live homogeneous control", "§12 + simulator", "SUPPORTED"],
                  ["Textile k ∈ 0.03–0.06 W/mK as slider bounds", "handbook typical values; primary measurement pending", "[16] + §19 pipeline", "PARTIALLY SUPPORTED"],
                  ["D_eff ∈ 10⁻⁶–10⁻⁵ m²/s as slider bounds", "order-of-magnitude literature; primary source pending", "§19 pipeline", "PARTIALLY SUPPORTED"],
                  ["ρ_bulk = 400, c_p = 1300 in prototype runs", "declared assumption, sensitivity covered by E3", "§09, §20 L-06", "ASSUMED"],
                  ["Constant T_skin = 34 °C", "declared simplification", "§20 L-03", "ASSUMED"],
                  ["PINN reaches ≤5% rel-L2 vs solver (H1)", "experiment E5 executed and logged", "§17", "PROPOSED"],
                  ["PINN beats data-only at N ≤ 150 (H2)", "experiment E5 ablation", "§17", "PROPOSED"],
                  ["Weave ⇒ CV(J_evap) > 10% vs ≈ 0 control (H3)", "experiment E4", "§17", "PROPOSED"],
                  ["Generalization degrades at unseen RH (H4)", "experiment E6", "§17", "PROPOSED"],
                  ["Model predicts human comfort, stress, or health outcomes", "would require human studies — not in scope", "—", "OUT OF SCOPE"],
                  ["Specific DOIs flagged in §24", "publisher page confirmation", "§19 pipeline", "NOT VERIFIED"],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="text-paper">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td className="font-mono text-[11.5px] text-aqua2/80">{r[2]}</td>
                    <td><Chip s={r[3] as any} small /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>
    </>
  );
}
