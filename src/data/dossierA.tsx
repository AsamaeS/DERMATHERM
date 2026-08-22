import React from "react";
import { Section, P, Callout, Eq, Chip, Mono, H3, Reveal, Card } from "../components/ui";
import { cite, refIndex, REFS } from "./refs";

export const C = ({ k }: { k: string }) => (
  <sup className="font-mono text-[10px] text-aqua2 font-semibold px-0.5">[{refIndex(k)}]</sup>
);

export function dossierA() {
  return (
    <>
      {/* =============== 01 =============== */}
      <Section id="s01" no="01" kicker="Verdict & scope" title="Executive scientific assessment">
        <Callout tone="ok" title="Overall verdict">
          The question is <b>scientifically meaningful and answerable as a computational study</b> — coupled
          heat–moisture transport in clothing textiles is established physics<C k="henry1939" /><C k="luikov1966" />
          <C k="liholcombe1992" /><C k="ghaddar2005" />, and physics-informed neural networks are an established
          method for parabolic PDEs<C k="raissi2019" /><C k="karniadakis2021" />. The risk is not the science; it is{" "}
          <b>overclaiming</b>. Every answer must be stated relative to a numerical reference, not to human outcomes.
        </Callout>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead>
                <tr><th>Audit item</th><th>Assessment</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>1 · Scientifically meaningful?</td>
                  <td>Yes. The skin–textile microclimate is a well-posed coupled transport problem; PINN surrogacy for such systems is an open, publishable question.</td>
                  <td><Chip s="SUPPORTED" small /></td>
                </tr>
                <tr>
                  <td>2 · Sufficiently specific?</td>
                  <td>No, as posed. “Model” needs an operational definition: which fields, against which reference, with which error metric, over which envelope of climates and materials.</td>
                  <td><Chip s="PROPOSED" small /></td>
                </tr>
                <tr>
                  <td>3 · What constitutes an answer?</td>
                  <td>A quantified statement: <Mono>PINN reproduces T(x,y,t), C_v(x,y,t) of the validated solver to ≤ X% relative L2 with PDE residual norm Y across envelope Z; physics terms reduce required reference data by factor F vs a data-only net.</Mono></td>
                  <td><Chip s="PROPOSED" small /></td>
                </tr>
                <tr>
                  <td>4 · Variables to predict</td>
                  <td>Primary: <Eq tex="T(x,y,t)" />, <Eq tex="C_v(x,y,t)" />. Derived (post-processed, never learned directly): evaporation flux <Eq tex="J_{evap}(y,t)" />, latent cooling <Eq tex="L_v J_{evap}" />, surface temperature spread.</td>
                  <td><Chip s="PROPOSED" small /></td>
                </tr>
                <tr>
                  <td>5 · What counts as validation?</td>
                  <td>A verification chain only: (V1) analytical benchmark, (V2) solver grid convergence, (V3) PINN vs solver in-distribution, (V4) PINN on unseen climates/materials. <b>No</b> human-subject or medical validation is in scope.</td>
                  <td><Chip s="PROPOSED" small /></td>
                </tr>
                <tr>
                  <td>6 · Strongest feasible contributions</td>
                  <td>(a) A benchmarked 2D coupled solver with interfacial evaporation; (b) a heterogeneity scenario set with a 1D-degeneracy control; (c) a PINN surrogate with honest data-efficiency comparison; (d) an audited parameter-evidence schema.</td>
                  <td><Chip s="PROPOSED" small /></td>
                </tr>
                <tr>
                  <td>7 · Must NOT be claimed</td>
                  <td>Medical or health outcomes; thermal-comfort scores as human predictions; “material X is best”; monetary savings; any result “validated” against people or garments we did not measure.</td>
                  <td><Chip s="OUT OF SCOPE" small /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      {/* =============== 02 =============== */}
      <Section id="s02" no="02" kicker="From vague to testable" title="Refined research questions">
        <P>
          The original question is preserved in direction but decomposed so that each piece has a numeric
          answer criterion. All three refer to a <b>numerical reference</b>, never to physiological outcomes.
        </P>
        <Card className="p-5 space-y-5">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-heat2 mb-1.5">RQ-1 · Accuracy</p>
            <p className="text-[15px] text-paper/90">
              With what accuracy (relative L2, RMSE, PDE-residual norm) does a physics-informed neural network
              reproduce the fields <Eq tex="T(x,y,t)" /> and <Eq tex="C_v(x,y,t)" /> of a 2D coupled
              diffusion model with interfacial evaporation, relative to a grid-converged finite-difference
              reference, across <Eq tex="T_\infty\in[30,45]\,°C" />, <Eq tex="RH_\infty\in[40,90]\,\%" />?
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-heat2 mb-1.5">RQ-2 · Data efficiency</p>
            <p className="text-[15px] text-paper/90">
              How does the error of the physics-constrained surrogate compare with a structurally identical
              data-only network as the number of reference snapshots decreases (N = 40…600)? Is the physics
              loss a measurable regularizer, and where does it fail?
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-heat2 mb-1.5">RQ-3 · Generalization & 2D necessity</p>
            <p className="text-[15px] text-paper/90">
              Does a single surrogate generalize across material parameter sets <Eq tex="(k, D_{eff}, L)" /> and
              heterogeneous microstructures without retraining, and does lateral heterogeneity produce
              evaporation non-uniformity that a 1D model provably cannot represent?
            </p>
          </div>
        </Card>
        <Callout tone="warn" title="Skeptical note">
          RQ-2 has a known failure mode: physics-informed training can be <i>harder to optimize</i> than data
          fitting, and stiff loss landscapes can hide behind good training losses<C k="krishnapriyan2021" />.
          The experiment must report optimization diagnostics, not only final errors.
        </Callout>
      </Section>

      {/* =============== 03 =============== */}
      <Section id="s03" no="03" kicker="Falsifiable statements" title="Research hypotheses">
        <Reveal>
          <div className="space-y-3">
            {[
              ["H1", "A PINN trained on ≤ 300 solver snapshots reaches rel-L2 ≤ 5% against the finite-difference reference on in-distribution climates.", "PROPOSED"],
              ["H2", "For N ≤ 150 snapshots, the PINN's rel-L2 is at least 2× lower than the data-only network's.", "PROPOSED"],
              ["H3", "Under a heterogeneous k(x,y) weave pattern, the coefficient of variation of J_evap(y) along the interface exceeds 10%, while the homogeneous control stays ≈ 0 — demonstrating genuine 2D behaviour.", "PROPOSED"],
              ["H4", "A non-parametric surrogate trained at RH ≤ 60% degrades sharply (rel-L2 > 2×) at RH ≥ 85%, motivating parametric (climate-conditioned) inputs.", "PROPOSED"],
            ].map(([id, text, st], i) => (
              <div key={id} className="flex gap-4 items-start bg-ink2/70 border border-line rounded-md p-4">
                <span className="font-display font-bold text-heat text-xl leading-none mt-0.5">{id}</span>
                <p className="text-[14px] text-paper/85 flex-1">{text}</p>
                <Chip s={st as any} small />
              </div>
            ))}
          </div>
        </Reveal>
        <P>
          Each hypothesis is tied to an experiment in §17 and a metric in §16. If an experiment contradicts a
          hypothesis, that is a <b>result</b>, not a failure — it is reported as such.
        </P>
      </Section>

      {/* =============== 04 =============== */}
      <Section id="s04" no="04" kicker="Evidence map" title="Related work" wide>
        <P>
          Prioritized: peer-reviewed papers, standards, established handbooks. For every entry the table
          states what it can legitimately justify. DOIs marked <Chip s="NOT VERIFIED" small /> must be checked
          before citation in the final paper (§19 pipeline).
        </P>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[860px]">
              <thead>
                <tr>
                  <th>#</th><th>Work</th><th>Field</th><th>Method</th><th>Relevance to Dermatherm</th><th>Justifies</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["raissi2019", "PINNs", "Deep-learning framework solving forward/inverse nonlinear PDEs with collocation residuals", "Defines the exact loss structure we adopt (§15): data + PDE residual + BC/IC penalties", "PINN formulation, AD requirement"],
                  ["karniadakis2021", "SciML review", "Survey of physics-informed learning; documents success on diffusion-type problems", "Positions the surrogate task; warns of training pathologies", "Methodology framing"],
                  ["krishnapriyan2021", "PINN diagnostics", "Characterizes failure modes (stiff losses, slow features) in PINN training", "Mandates our reporting of residual norms and optimization diagnostics", "Experiment design §17-5"],
                  ["henry1939", "Coupled transport", "Classical theory of simultaneous heat and vapour diffusion in porous media ('dry' permeability)", "Legitimizes a vapour-diffusion + latent-heat coupling without liquid water as a first model", "Eqs. (1)–(2) structure"],
                  ["luikov1966", "Coupled transport", "Capillary-porous media theory; potential-based coupled heat/mass transfer", "Theoretical ancestor of the coupling terms; also the warning that full coupling is larger than we model", "Scope delimitation"],
                  ["liholcombe1992", "Textile physics", "Two-stage sorption model of coupled moisture–heat diffusion in wool fabrics", "Shows coupled T–moisture PDE systems are standard in textile science; sorption is the term we defer", "Eq. justification; future work"],
                  ["fansun2003", "Textile physics", "Heat and moisture transfer in porous media with phase change (condensation/evaporation source terms)", "Supports volumetric latent-heat source representation of phase change", "Evaporation sink term"],
                  ["ghaddar2005", "Skin–clothing model", "Coupled bio-heat + bio-mass transfer from skin through clothing to environment", "Closest system-level analogue; supplies the skin-side flux/Robin template and its limitations", "Boundary conditions §10"],
                  ["fiala1999", "Thermoregulation", "Multi-node human thermoregulation (passive + active system)", "Defines what our constant-T_skin assumption omits; a future coupling target", "Limitations §20"],
                  ["fanger1970", "Comfort", "PMV/PPD comfort model", "Delimits 'thermal comfort' as a separate, NOT claimed, application domain", "No-claim list §01"],
                  ["gagge1986", "Comfort/stress", "Two-node human model, SET index", "Separates comfort indices from physical transport — we compute neither as human predictions", "Scope"],
                  ["iso9920", "Standard", "Clothing insulation estimation; empirical convection coefficient h_c(v)", "Source of the h(v) correlation used at the ambient boundary", "BC parameter"],
                  ["iso11092", "Standard", "Sweating guarded hotplate: R_ct, R_et measurement", "Defines the standard experimental observables our simulated fluxes can later be compared with", "Future validation"],
                  ["iso7243", "Standard", "WBGT heat-stress assessment", "Grounds 'extreme conditions' in an operational occupational metric (context only)", "Motivation §14"],
                  ["ashrae55", "Standard", "Thermal comfort conditions", "Terminology boundary: comfort ≠ heat stress ≠ medical outcome", "Definitions"],
                  ["ashraefund", "Handbook", "Psychrometrics + clothing property tables", "Typical textile k, c_p ranges; saturation relations", "Parameter ranges §09"],
                  ["buck1981", "Physical chemistry", "Vapour-pressure equations", "C_sat(T) at the evaporating interface", "Evaporation model §11"],
                  ["bsl2002", "Transport phenomena", "Standard heat/mass transfer text", "Fourier/Fick forms; Lewis relation h_m = h/(ρc_p)_air for Le ≈ 1", "h_m derivation §11"],
                  ["sherwood2010", "Climate physiology", "Wet-bulb temperature adaptability limit", "Why coupled heat+humidity transport matters at extremes (context, not a model input)", "Motivation"],
                  ["ipcc2021", "Climate science", "AR6: increasing frequency of extreme heat/humidity events", "Problem significance; strictly as context", "Motivation"],
                  ["havenith2013", "Clothing science", "Representation of clothing evaporative resistance in standards", "Links simulated J_evap to the R_et language used by industry", "Interpretation §22"],
                ].map(([key, field, method, rel, just], i) => (
                  <tr key={key as string}>
                    <td className="font-mono text-dim">{refIndex(key as string)}</td>
                    <td className="text-paper whitespace-nowrap">
                      {(() => {
                        const r = REFS.find((x) => x.key === key);
                        const first = r ? r.authors.split(",")[0].split(" ").slice(-1)[0] : key;
                        return `${first} ${r ? r.year : ""}`;
                      })()}
                    </td>
                    <td className="text-muted">{field}</td>
                    <td>{method}</td>
                    <td>{rel}</td>
                    <td className="text-aqua2/90">{just}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Callout tone="info" title="Honesty rule applied">
          Full metadata (authors, year, venue, DOI, DOI-status) lives in the §24 registry. Where this assistant
          could not independently verify a DOI it is flagged <Chip s="NOT VERIFIED" small /> and must pass the
          Firecrawl+Qwen check (§19) before use in the manuscript.
        </Callout>
      </Section>

      {/* =============== 05 =============== */}
      <Section id="s05" no="05" kicker="What is missing" title="Research gap">
        <Card className="p-5 space-y-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-dim mb-1.5">Existing work</p>
            <p className="text-[14.5px] text-paper/85">
              Coupled heat–moisture PDE models of textiles exist, mostly 1D or node-based, with sorption and
              condensation terms<C k="henry1939" /><C k="liholcombe1992" /><C k="fansun2003" />; system-level
              skin–clothing–environment models exist for comfort prediction<C k="ghaddar2005" />
              <C k="fiala1999" />; PINNs are proven for diffusion-type PDEs<C k="raissi2019" /><C k="karniadakis2021" />.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-warn mb-1.5">Limitation</p>
            <p className="text-[14.5px] text-paper/85">
              These threads have not been joined into a <b>verified physics-informed surrogate of the 2D
              heterogeneous skin–textile interface</b> under extreme-climate forcing, with an explicit
              verification chain (analytical benchmark → grid-converged solver → surrogate) and an audited,
              source-linked parameter base. Most textile models are not released as reproducible computational
              artifacts, and most PINN studies do not treat material heterogeneity and interfacial phase change
              together.
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-aqua mb-1.5">Proposed contribution</p>
            <p className="text-[14.5px] text-paper/85">
              A minimal, fully documented, reproducible framework: 2D coupled solver + heterogeneity scenarios +
              PINN surrogate + honest comparison protocol + evidence schema (§21 lists these as{" "}
              <Chip s="PROPOSED" small /> until the experiment log demonstrates them).
            </p>
          </div>
        </Card>
        <Callout tone="warn" title="Do not invent the gap">
          If the Firecrawl sweep finds an existing 2D PINN skin–textile study, this section is rewritten to
          differentiate on verifiability, heterogeneity handling, or the extreme-condition envelope — never by
          pretending the literature is empty.
        </Callout>
      </Section>

      {/* =============== 06 =============== */}
      <Section id="s06" no="06" kicker="Skeptical review" title="Physical model — critical audit of the conceptual equations">
        <P>
          The proposed conceptual system is <Eq tex="\rho c_p\,\partial_t T = \nabla\!\cdot(k\nabla T) + Q - L_v S_{evap}" />{" "}
          and <Eq tex="\partial_t C_v = \nabla\!\cdot(D_{eff}\nabla C_v) + S_{sweat} - S_{evap}" />. Audit results:
        </P>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[760px]">
              <thead><tr><th>Q.</th><th>Issue</th><th>Verdict</th></tr></thead>
              <tbody>
                {[
                  ["1", "Dimensional consistency", "Consistent IF S terms are volumetric [kg·m⁻³·s⁻¹] and Q is [W·m⁻³]. Sweat is actually supplied at a surface [kg·m⁻²·s⁻¹] — it must enter as a boundary flux, not a free volume source, or be divided by an interface thickness. Our solver uses the flux form (Neumann BC) — cleaner."],
                  ["2", "Sufficiency", "Sufficient for a vapour-diffusion regime with interfacial phase change (Henry-type 'dry' permeability). Insufficient if liquid sweat wets the yarns or fibre sorption dominates — both are explicit exclusions."],
                  ["3", "Assumptions required", "Local thermal equilibrium (single T for fibre+air+vapour); ideal-gas vapour; constant ρc_p, k, D per material region; no advection; no radiation; no sorption heat; dilute vapour."],
                  ["4", "C_v vs humidity ratio", "C_v [kg·m⁻³] is the better state variable: Fick's law is native, units are closed, no dry-air bookkeeping needed inside a porous solid. Humidity ratio w needs dry-air density — awkward in a solid matrix."],
                  ["5", "Vapour pressure instead?", "p_v is linearly related to C_v by p_v = C_v R_v T. Because T varies, the transform is state-dependent; keeping C_v primary and computing p_v diagnostically avoids extra coupling terms."],
                  ["6", "Separate liquid water?", "Not in the prototype. Justified when sweat supply ≤ evaporative capacity (all sweat evaporates at/near the interface). Must be revisited at high sweat rates — flagged LIMITATION L-01."],
                  ["7", "Intra-textile convection?", "Negligible for natural convection inside mm-scale pores at these ΔT; through-flow only matters with wind penetration. Excluded; the ambient boundary absorbs wind via h(v)."],
                  ["8", "Darcy?", "Only if a pressure gradient drives bulk flow (ventilated garments). Not needed here."],
                  ["9", "Fickian diffusion sufficient?", "Yes for the vapour phase in the first prototype. Knudsen effects in sub-µm pores are ignored (pore diameters ≫ mean free path ~68 nm)."],
                  ["10", "Evaporation model", "Interfacial mass-transfer law J = h_m(C_sat(T_skin) − C_v|skin), §11. Volumetric S_evap = J/Δx confined to the skin-adjacent layer."],
                  ["11", "Condensation", "Same law with negative J (C_v|skin > C_sat). Releases latent heat via the same L_v term. Simplified: no nucleation physics, no liquid storage — sign flip only."],
                  ["12", "Latent heat placement", "Yes — volumetric sink −L_v S_evap in the heat equation, co-located with the mass sink. Dimensionally [J·kg⁻¹][kg·m⁻³·s⁻¹] = [W·m⁻³]. ✓"],
                  ["13", "Justified couplings", "(a) latent heat source; (b) C_sat(T) at the interface; (c) T-dependence of D, k is a documented second-order effect — deferred (constant properties per region)."],
                  ["14", "Safely omitted first", "Sorption isotherm and bound-water diffusion, radiative transfer, pressure-driven flow, property T/RH dependence, physiological feedback. Each carries a limitation ID in §20."],
                ].map(([n, issue, verdict]) => (
                  <tr key={n}><td className="font-mono text-heat2">{n}</td><td className="text-paper whitespace-nowrap">{issue}</td><td>{verdict}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      {/* =============== 07 =============== */}
      <Section id="s07" no="07" kicker="Final form" title="Governing equations">
        <P>Adopted system on <Eq tex="\Omega=(0,L_x)\times(0,L_y)" />, with <Eq tex="x" /> through the textile and <Eq tex="y" /> lateral:</P>
        <Eq block tex="\rho c_p\,\frac{\partial T}{\partial t} \;=\; \nabla\cdot\big(k(x,y)\,\nabla T\big) \;-\; L_v\,S_{evap}(x,y,t)" />
        <Eq block tex="\frac{\partial C_v}{\partial t} \;=\; \nabla\cdot\big(D_{eff}(x,y)\,\nabla C_v\big) \;+\; S_{sweat}(y)\,\delta_\Gamma \;-\; S_{evap}(x,y,t)" />
        <Eq block tex="J_{evap}(y,t) \;=\; h_m\big(C_{sat}(T_{skin}) - C_v\big|_{x=0}\big), \qquad S_{evap}\big|_{interface} = J_{evap}/\Delta x" />
        <Reveal>
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-heat2 mb-2">Heat eq.</p>
              <p className="text-[13px] text-paper/80 leading-relaxed">
                Fourier conduction with heterogeneous <Mono>k(x,y)</Mono>; all terms [W·m⁻³]. Metabolic heat
                lives at the skin boundary, not in the fabric — <Mono>Q ≡ 0</Mono> in Ω. Latent sink confined
                to the interface layer. Source: Fourier form<C k="bsl2002" />, coupling<C k="henry1939" /><C k="fansun2003" />.
              </p>
            </Card>
            <Card className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-aqua2 mb-2">Moisture eq.</p>
              <p className="text-[13px] text-paper/80 leading-relaxed">
                Fickian vapour diffusion with heterogeneous <Mono>D_eff(x,y)</Mono>; terms [kg·m⁻³·s⁻¹]. Sweat
                enters as the boundary flux <Mono>S_sweat(y)</Mono> on Γ_skin (<Mono>δ_Γ</Mono> notation), not as a
                volumetric fantasy source. Source: Fick form<C k="bsl2002" />, textile precedent<C k="liholcombe1992" />.
              </p>
            </Card>
            <Card className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-heat2 mb-2">Interface closure</p>
              <p className="text-[13px] text-paper/80 leading-relaxed">
                Evaporation/condensation as a mass-transfer law driven by the saturation deficit at skin
                temperature; <Mono>C_sat</Mono> via Buck<C k="buck1981" />, <Mono>h_m</Mono> via Lewis relation<C k="bsl2002" />.
                Sign of J selects evaporation (sink, cools) vs condensation (source, warms).
              </p>
            </Card>
          </div>
        </Reveal>
        <Callout tone="critical" title="Simplification register (per Rule 14)">
          S-01 constant properties per material region · S-02 no bound-water/sorption term · S-03 no liquid
          phase · S-04 interface evaporation collapsed to one cell layer · S-05 radiation omitted · S-06 constant
          T_skin. Each maps to a §20 limitation and a §23 extension.
        </Callout>
      </Section>

      {/* =============== 08 =============== */}
      <Section id="s08" no="08" kicker="Nomenclature" title="Variable definitions and units" wide>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[820px]">
              <thead><tr><th>Symbol</th><th>Quantity</th><th>SI unit</th><th>Role</th><th>Prototype value / range</th><th>Evidence</th></tr></thead>
              <tbody className="font-mono text-[12px]">
                {[
                  ["T", "temperature", "K (°C)", "state", "24–46 °C in domain", "—"],
                  ["C_v", "water-vapour concentration", "kg·m⁻³", "state", "0–0.065", "—"],
                  ["k", "effective thermal conductivity", "W·m⁻¹·K⁻¹", "material", "0.025–0.10 (air 0.0262)", "§09 PARTIALLY SUPPORTED"],
                  ["D_eff", "effective moisture diffusivity", "m²·s⁻¹", "material", "0.3–3.0 ×10⁻⁵ (air 2.5×10⁻⁵)", "§09 PARTIALLY SUPPORTED"],
                  ["ρ", "bulk density", "kg·m⁻³", "material", "400 (assumed typical)", "§09 ASSUMED"],
                  ["c_p", "specific heat capacity", "J·kg⁻¹·K⁻¹", "material", "1300 (assumed typical)", "§09 ASSUMED"],
                  ["L_x", "fabric thickness", "m", "geometry", "0.5–4 mm", "measurable"],
                  ["L_v", "latent heat of vaporisation", "J·kg⁻¹", "constant", "2.426×10⁶ at 34 °C", "SUPPORTED (steam tables)"],
                  ["R_v", "vapour gas constant", "J·kg⁻¹·K⁻¹", "constant", "461.5", "SUPPORTED (standard)"],
                  ["h", "convective heat-transfer coeff.", "W·m⁻²·K⁻¹", "BC param", "10.45−v+10√v (ISO-type)", "SUPPORTED [12]"],
                  ["h_m", "convective mass-transfer coeff.", "m·s⁻¹", "BC param", "h/(ρc_p)_air, Le≈1", "SUPPORTED [18]"],
                  ["T_skin", "skin temperature", "°C", "BC param", "34 fixed", "ASSUMED (L-06)"],
                  ["J_sweat", "sweat supply flux", "kg·m⁻²·s⁻¹", "BC forcing", "0–80 g·m⁻²·h⁻¹", "range for local skin; literature varies"],
                  ["C_sat(T)", "saturation vapour concentration", "kg·m⁻³", "closure", "Buck p_sat / (R_v T)", "SUPPORTED [17]"],
                  ["α_T", "thermal diffusivity", "m²·s⁻¹", "derived", "k/(ρc_p)", "DERIVED"],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="text-aqua2">{r[0]}</td><td className="text-paper font-body">{r[1]}</td><td>{r[2]}</td>
                    <td className="font-body text-muted">{r[3]}</td><td>{r[4]}</td>
                    <td className="font-body text-[12px] text-dim">{r[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </Section>

      {/* =============== 09 =============== */}
      <Section id="s09" no="09" kicker="Rule: no value without a source" title="Material parameter evidence base" wide>
        <P>
          This section is deliberately <b>not</b> a table of confident numbers. Per project rules, values that
          cannot be traced to a cited measurement are labelled and routed to the extraction pipeline (§19).
          Where the literature is insufficient to support a claim, the record reads{" "}
          <Mono c="text-warn">INSUFFICIENT EVIDENCE</Mono> rather than a guessed value.
          Ranges below are <b>handbook-typical magnitudes</b> used only to set physically plausible slider bounds
          in the prototype; they are <b>not</b> cited material data.
        </P>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[820px]">
              <thead><tr><th>Parameter</th><th>Prototype range</th><th>Material scope</th><th>Source class</th><th>Confidence</th><th>Status</th></tr></thead>
              <tbody>
                {[
                  ["k, thermal conductivity", "0.03–0.06 W·m⁻¹K⁻¹ (clothing fabrics, still air)", "cotton/PET/wool typical", "ASHRAE Handbook—Fundamentals (clothing ch.)", "textbook-typical", "PARTIALLY SUPPORTED"],
                  ["k, air in pores", "0.0262 W·m⁻¹K⁻¹ at 25 °C", "still air", "standard transport data", "high", "SUPPORTED"],
                  ["ρ_fibre, fibre density", "cotton ≈1500–1560; PET ≈1380 kg·m⁻³", "fibre, not bulk fabric", "textile handbooks (unverified)", "low — needs extraction", "NOT VERIFIED"],
                  ["ρ_bulk, fabric bulk", "≈100–500 kg·m⁻³ depending on structure", "all", "structure-dependent; not a material constant", "—", "ASSUMED (400 used)"],
                  ["c_p", "cotton ≈1300; PET ≈1200–1420 J·kg⁻¹K⁻¹", "fibres", "handbook-typical", "medium", "PARTIALLY SUPPORTED"],
                  ["D_eff, vapour in fabric", "≈10⁻⁶–10⁻⁵ m²·s⁻¹ (order of magnitude)", "depends on porosity/tortuosity", "order-of-magnitude only", "low", "NOT VERIFIED"],
                  ["D, vapour in air", "2.5×10⁻⁵ m²·s⁻¹ at 25 °C", "air", "standard transport data", "high", "SUPPORTED"],
                  ["R_et, evaporative resistance", "measured per ISO 11092", "ensembles/fabrics", "measurement standard, not a constant", "method", "SUPPORTED (method)"],
                  ["thickness", "0.3–3 mm typical apparel", "all", "directly measurable", "high", "MEASURED (per sample)"],
                  ["porosity", "0.6–0.9 typical knit/woven", "structure class", "image/geometry-based", "medium", "PARTIALLY SUPPORTED"],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="text-paper">{r[0]}</td><td className="font-mono text-[12px] text-aqua2/90">{r[1]}</td>
                    <td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td><Chip s={r[5] as any} small /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Callout tone="warn" title="Why reported values disagree (and why we must not average them away)">
          k and D_eff are <b>structural</b> properties: they depend on porosity, fibre orientation, compression,
          moisture content and temperature. Two papers measuring “cotton” measure two different structures —
          disagreement is physics, not noise. The evidence schema (§19) therefore records structure and
          conditions with every value.
        </Callout>
        <H3>Sensitivity dependencies (qualitative, textbook-level)</H3>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl">
              <thead><tr><th>Parameter</th><th>humidity</th><th>temperature</th><th>structure</th><th>compression</th><th>wetness</th></tr></thead>
              <tbody>
                {[
                  ["k", "MED (water replaces air)", "LOW", "HIGH", "HIGH", "HIGH"],
                  ["D_eff", "MED", "MED (~T^1.75 in air)", "HIGH", "HIGH", "HIGH (liquid paths)"],
                  ["c_p", "MED (bound water)", "LOW", "LOW", "NONE", "MED"],
                  ["ρ_bulk", "LOW", "NONE", "HIGH", "HIGH", "MED"],
                ].map((r, i) => {
                  const lvl = (s: string) =>
                    s === "HIGH" ? "text-heat2" : s === "MED" ? "text-warn" : s === "NONE" ? "text-dim" : "text-aqua2";
                  return (
                    <tr key={i} className="font-mono text-[12px]">
                      <td className="text-paper">{r[0]}</td>
                      {r.slice(1).map((s, j) => <td key={j} className={lvl(s)}>{s}</td>)}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Reveal>
        <Card className="p-4">
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-dim mb-2">Required entry template (every value must fill this)</p>
          <pre className="font-mono text-[11.5px] leading-relaxed text-aqua2/90 overflow-x-auto">{`PARAMETER:            VALUE:        UNIT:
MATERIAL:             STRUCTURE:    THICKNESS:
EXPERIMENTAL COND.:   TEMPERATURE:  REL. HUMIDITY:
MEASUREMENT METHOD:   SOURCE:       DOI:
CONFIDENCE:           (MEASURED | REPORTED | DERIVED | ASSUMED)`}</pre>
        </Card>
      </Section>

      {/* =============== 10 =============== */}
      <Section id="s10" no="10" kicker="Physics first, coding convenience never" title="Boundary conditions" wide>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[860px]">
              <thead><tr><th>Boundary</th><th>Field</th><th>Type & equation</th><th>Physical meaning</th><th>Support</th><th>Limitation</th></tr></thead>
              <tbody>
                <tr>
                  <td className="text-paper">Skin Γ_s · thermal</td><td>T</td>
                  <td className="font-mono text-[12px]">Dirichlet: T = T_skin (34 °C)</td>
                  <td>Prescribed interface temperature; the strong-perfusion limit of a skin energy balance.</td>
                  <td>Standard first approximation; Robin alternative −k∇T·n = h_sk(T_sk−T)+q_met exists in bio-heat models<C k="ghaddar2005" />.</td>
                  <td>Removes all thermoregulation; skin cannot warm or cool. L-06.</td>
                </tr>
                <tr>
                  <td className="text-paper">Skin Γ_s · moisture</td><td>C_v</td>
                  <td className="font-mono text-[12px]">Neumann: −D∇C_v·n = J_sweat(y)</td>
                  <td>Sweat vapour supply flux into the fabric; spatially variable for hotspot scenarios.</td>
                  <td>Flux BC is the natural sweating specification; ISO 11092 hotplates impose analogous fluxes<C k="iso11092" />.</td>
                  <td>Assumes sweat arrives as vapour at the interface; liquid runoff not represented. L-01.</td>
                </tr>
                <tr>
                  <td className="text-paper">Ambient Γ_a · thermal</td><td>T</td>
                  <td className="font-mono text-[12px]">Robin: −k∇T·n = h(T−T_∞)</td>
                  <td>Convective exchange with moving air; h(v) empirical, ISO 9920-type<C k="iso9920" />.</td>
                  <td>Standard; correlation widely used in clothing standards.</td>
                  <td>Correlation fitted on clothed manikins — transferring it to a flat 2D patch is an assumption. L-09.</td>
                </tr>
                <tr>
                  <td className="text-paper">Ambient Γ_a · moisture</td><td>C_v</td>
                  <td className="font-mono text-[12px]">Robin: −D∇C_v·n = h_m(C_v−C_∞)</td>
                  <td>Convective vapour removal; C_∞ = RH_∞·C_sat(T_∞); h_m from Lewis relation (Le≈1)<C k="bsl2002" />.</td>
                  <td>Chilton–Colburn analogy is standard transport theory.</td>
                  <td>Le≈1 is good for air–water but not exact; wind penetration ignored.</td>
                </tr>
                <tr>
                  <td className="text-paper">Lateral Γ_y</td><td>both</td>
                  <td className="font-mono text-[12px]">Periodic</td>
                  <td>The patch is one period of a repeating textile structure — exactly what weave/seam patterns model.</td>
                  <td>Standard unit-cell idealization in porous-media modelling.</td>
                  <td>Wrong for isolated features (a single pocket); then no-flux is the honest alternative.</td>
                </tr>
                <tr>
                  <td className="text-paper">Initial</td><td>both</td>
                  <td className="font-mono text-[12px]">Linear T, C_v profiles between boundaries</td>
                  <td>Cheap, neutral start; transients wash it out in ~5τ, τ = L²/α.</td>
                  <td>—</td>
                  <td>Only affects short-time statistics; never used in steady metrics.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Callout tone="info" title="Units check (Rule 7)">
          Dirichlet [K]; Neumann flux [kg·m⁻²·s⁻¹]; Robin heat [W·m⁻²] = [W·m⁻²K⁻¹][K] ✓; Robin mass
          [kg·m⁻²·s⁻¹] = [m·s⁻¹][kg·m⁻³] ✓.
        </Callout>
      </Section>

      {/* =============== 11 =============== */}
      <Section id="s11" no="11" kicker="The critical closure" title="Evaporation model">
        <P>
          The causal chain we implement — every link has a cited source, and <b>no fitted coefficient is
          invented</b>: h comes from an ISO-type correlation<C k="iso9920" />, h_m from the Lewis relation<C k="bsl2002" />,
          C_sat from Buck<C k="buck1981" />.
        </P>
        <Reveal>
          <pre className="font-mono text-[11.5px] leading-loose text-paper/85 bg-ink2/70 border border-line rounded-md p-4 overflow-x-auto">{`T_skin ──Buck──▶ p_sat(T_skin) ──ideal gas──▶ C_sat(T_skin)
                                                  │
ambient ─RH─▶ C_∞ = RH·C_sat(T_∞) ──BC──▶ C_v field │
                                                  ▼
                          ΔC = C_sat(T_skin) − C_v|skin
                                  │
                          J_evap = h_m · ΔC          [kg·m⁻²·s⁻¹]
                              ╱          ╲
            moisture sink S_evap=J/Δx   latent cooling Q = L_v·J  [W·m⁻²]`}</pre>
        </Reveal>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[760px]">
              <thead><tr><th>Approach</th><th>Form</th><th>Verdict for prototype</th></tr></thead>
              <tbody>
                <tr><td className="text-paper">A · simplified flux</td><td>J = const</td><td>Rejected — erases the humidity dependence that is the whole point of the study.</td></tr>
                <tr><td className="text-paper">B · vapour-pressure difference</td><td>J ∝ (p_sat(T_sk) − p_v,∞)</td><td>Correct physics but skips the fabric-side resistance; ambient-only driving force. Keep as diagnostic (Δp reporting), not as the model.</td></tr>
                <tr><td className="text-aqua2">C · mass-transfer coefficient ✓ adopted</td><td>J = h_m(C_sat(T_sk) − C_v|skin)</td><td>Uses the <i>computed</i> interface concentration, so fabric resistance enters naturally; h_m derived, not fitted.</td></tr>
                <tr><td className="text-paper">D · saturation-pressure model</td><td>C_sat(T) closure</td><td>Adopted as the C_sat source (Buck) — part of C, not an alternative.</td></tr>
                <tr><td className="text-paper">E · fully coupled heat/mass</td><td>interface energy + mass balances solved simultaneously with skin</td><td>Physically complete<C k="ghaddar2005" />; requires skin energy balance — future work (§23), not the 3–4 day prototype.</td></tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Callout tone="ok" title="Consistency with standards">
          ISO 11092 expresses evaporation through evaporative resistance R_et with driving force
          (p_skin − p_ambient)<C k="iso11092" /><C k="havenith2013" />. Our J_evap is the <i>local field version</i> of the
          same physics; the area-averaged steady flux can be converted to an apparent R_et for comparison
          language with industry — conversion planned, not claimed yet.
        </Callout>
      </Section>

      {/* =============== 12 =============== */}
      <Section id="s12" no="12" kicker="Why 2D at all" title="2D heterogeneity model">
        <P>
          Honest starting point: a homogeneous slab with uniform BCs <b>is mathematically 1D</b> — ∂/∂y ≡ 0 is an
          exact solution, and our homogeneous preset demonstrates this (surface-T sparkline flat, CV ≈ 0). 2D is
          justified only when y-structure exists. Candidates, with feasibility:
        </P>
        <Reveal>
          <div className="overflow-x-auto">
            <table className="tbl min-w-[720px]">
              <thead><tr><th>Scenario</th><th>Physics</th><th>Feasibility (3–4 days)</th><th>Scientific yield</th></tr></thead>
              <tbody>
                <tr><td className="text-paper">k(x,y) weave patches</td><td>warp/weft blocks with different conductivity & diffusivity</td><td className="text-ok">trivial — pattern arrays</td><td>HIGH: direct 2D signature in T_surf(y), J_evap(y)</td></tr>
                <tr><td className="text-aqua2">S_sweat(y) hotspot ✓ co-primary</td><td>localised perspiration (e.g. near a seam line)</td><td className="text-ok">trivial</td><td>HIGH: evaporation–cooling map, condensation risk nearby</td></tr>
                <tr><td className="text-paper">pore array</td><td>air inclusions (k_air, D_air)</td><td className="text-ok">easy</td><td>MED-HIGH: shows harmonic averaging necessity</td></tr>
                <tr><td className="text-paper">seam strip</td><td>low-k, low-D vertical band</td><td className="text-ok">easy</td><td>MED: thermal bridge/shade effect</td></tr>
                <tr><td className="text-paper">non-uniform ambient forcing</td><td>h(y) or T_∞(y)</td><td className="text-warn">easy but weak story</td><td>LOW: boundary artefact more than material science</td></tr>
                <tr><td className="text-paper">multilayer stack</td><td>layered k(x) steps</td><td className="text-warn">still 1D if uniform in y</td><td>LOW for 2D claim — use only as 1D validation case</td></tr>
              </tbody>
            </table>
          </div>
        </Reveal>
        <Callout tone="ok" title="Recommended primary 2D demonstration">
          <b>Plain-weave k/D patchiness + a localised sweat hotspot</b>, against the homogeneous control.
          Quantify 2D-ness with the coefficient of variation of J_evap(y) and T_surf(y): homogeneous ⇒ CV ≈ 0
          (verifies the degeneracy claim), weave ⇒ CV ≫ 0 with pattern-locked spatial spectra. Implementable in
          hours; scientifically clean; directly visible in the live simulator below.
        </Callout>
      </Section>
    </>
  );
}
