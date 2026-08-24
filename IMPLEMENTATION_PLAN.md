# DERMATHERM IMPLEMENTATION PLAN
**Status:** Research-grade hackathon — Physics → API → Real Data → Visualization → ML → Deployment

## ARCHITECTURE DECISION

Given the existing **fully-functional browser-resident solver and PINN**, the optimal architecture is:

**HYBRID: Keep computational engines in-browser + Add backend for orchestration, storage, and AI services**

### Why this approach:
1. ✅ The 2D solver ALREADY WORKS and runs deterministically in the browser
2. ✅ The PINN benchmark with exact AD ALREADY WORKS in the browser  
3. ✅ No deployment complexity for compute-heavy operations
4. ✅ Reproducible: same code, same results, anywhere
5. ✅ Aligns with the research prototype positioning

### Backend responsibilities:
- Experiment configuration storage & retrieval
- Material database with evidence provenance
- External AI/literature services (Qwen, Firecrawl, Wolfram)
- Export/report generation
- Optional: Pre-computed result caching

---

## IMPLEMENTATION PHASES

### P0 — CORE SCIENTIFIC FUNCTIONALITY (Days 1-2)

#### 1. Backend Architecture
```
dermatherm/
├── backend/
│   ├── api/                  # FastAPI or Express REST endpoints
│   ├── services/
│   │   ├── material.py/ts    # Material DB with provenance
│   │   ├── experiment.py/ts  # Experiment ledger
│   │   ├── qwen.py/ts        # Featherless/Qwen integration
│   │   ├── firecrawl.py/ts   # Literature retrieval
│   │   └── wolfram.py/ts     # Optional verification
│   ├── models/               # Data schemas
│   └── db/                   # SQLite or JSON store
├── frontend/                 # Existing React app
├── physics/                  # Extract from src/lib/solver.ts
├── ml/                       # Extract from src/lib/pinn.ts  
└── docker-compose.yml
```

**Language choice:** TypeScript/Node.js for full-stack consistency
- Reuse existing solver.ts and pinn.ts
- Simpler deployment
- Browser ↔ Backend type safety

#### 2. Material Database Schema
```typescript
interface Material {
  id: string;                    // MAT-YYYY-NNN
  name: string;
  category: string;
  parameters: {
    k: ParameterEvidence;        // Thermal conductivity
    D_eff: ParameterEvidence;    // Moisture diffusivity  
    thickness: ParameterEvidence;
    rho: ParameterEvidence;
    cp: ParameterEvidence;
  };
  created_at: string;
  updated_at: string;
}

interface ParameterEvidence {
  value: number | [number, number]; // Single value or range
  unit: string;
  status: "LITERATURE-SUPPORTED" | "ASSUMED / DEMONSTRATION" | "NOT VERIFIED";
  source?: string;                  // Citation or reference
  doi?: string;
  experimental_conditions?: string;
  quote?: string;                   // Verbatim from paper
  confidence?: "MEASURED" | "REPORTED" | "DERIVED" | "ASSUMED";
}
```

#### 3. Experiment Schema  
```typescript
interface Experiment {
  id: string;                    // EXP-YYYY-NNN
  created_at: string;
  status: "CONFIGURED" | "RUNNING" | "COMPLETED" | "FAILED";
  
  // Configuration
  climate: {
    T_inf: number;               // °C
    RH_inf: number;              // %
    v_air: number;               // m/s
    sweat_rate: number;          // g/m²/h
  };
  
  material_id: string;
  parameters: {                  // Snapshot at run time
    k: number;
    D_eff: number;
    thickness: number;
    rho: number;
    cp: number;
  };
  
  scenario: "homo" | "weave" | "pores" | "seam";
  hotspot: boolean;
  
  // Solver config
  solver: {
    type: "FTCS_2D";
    grid: { nx: number; ny: number };
    dt_method: "CFL_limited";
    version: string;
  };
  
  // Results (computed by browser, sent to backend)
  results?: {
    fields: {
      T?: number[][];            // Can be compressed
      C_v?: number[][];
    };
    metrics: SimMetrics;
    conservation_check: {
      mass_balance_error: number;
      passed: boolean;
    };
  };
  
  // Provenance
  limitations: string[];         // List of L-01, L-02, etc
  assumptions: string[];         // List of assumptions
}
```

#### 4. Backend API Endpoints
```
POST   /api/materials              Create material record
GET    /api/materials              List all materials
GET    /api/materials/:id          Get material by ID
PUT    /api/materials/:id          Update material
DELETE /api/materials/:id          Delete material

POST   /api/experiments            Create experiment config
GET    /api/experiments            List experiments
GET    /api/experiments/:id        Get experiment
PATCH  /api/experiments/:id/status Update status
POST   /api/experiments/:id/results Submit simulation results
GET    /api/experiments/:id/export  Export as JSON/PDF

GET    /api/evidence               Search evidence database
POST   /api/evidence/extract       Trigger Qwen extraction
POST   /api/literature/search      Firecrawl literature search

GET    /api/health                 Health check
```

#### 5. Frontend ↔ Backend Integration
- Simulation still runs **entirely in browser**
- After simulation completes, frontend POSTs results to `/api/experiments/:id/results`
- Material parameters loaded from backend `/api/materials`
- Experiments list from `/api/experiments`

---

### P1 — PHYSICS-INFORMED ML (Days 2-3)

#### 6. Extend PINN to Coupled 2D System
Current: 1D heat equation benchmark
Target: 2D coupled T + C_v

```typescript
// ml/pinn_coupled.ts
interface CoupledPinnConfig {
  alpha_T: number;      // Thermal diffusivity
  D_eff: number;        // Moisture diffusivity
  rho_cp: number;
  L_v: number;          // Latent heat
  
  // Parametric inputs (generalization)
  parametric: boolean;  // If true, network takes (x,y,t,T_inf,RH_inf,k,D)
  
  // Training
  n_data: number;       // Reference snapshots
  n_collocation: number;
  n_boundary: number;
  n_ic: number;
}

interface PinnOutput {
  T: number;
  C_v: number;
  // Derivatives (from AD)
  T_t: number;
  T_xx: number;
  T_yy: number;
  C_t: number;
  C_xx: number;
  C_yy: number;
}

// Loss function
L_total = λ_data * L_data + 
          λ_heat * L_heat +       // PDE residual heat eq
          λ_moisture * L_moisture + // PDE residual moisture eq
          λ_bc * L_bc +
          λ_ic * L_ic
```

#### 7. Training Pipeline
```typescript
// ml/trainer.ts
class CoupledPinnTrainer {
  // 1. Generate synthetic training data from solver
  generateTrainingData(experiments: Experiment[]): Dataset
  
  // 2. Train PINN
  train(config: CoupledPinnConfig, dataset: Dataset): TrainedModel
  
  // 3. Evaluate
  evaluate(model: TrainedModel, test_data: Dataset): Metrics
  
  // 4. Compare: Solver vs Data-only vs PINN
  compare(): ComparisonReport
}
```

#### 8. Backend ML Endpoints
```
POST   /api/ml/train              Trigger PINN training (browser-based or server)
GET    /api/ml/models             List trained models  
GET    /api/ml/models/:id         Get model
POST   /api/ml/predict            Run prediction (if model is server-side)
POST   /api/ml/compare            Generate comparison (solver vs data vs PINN)
```

---

### P2 — SCIENTIFIC EVIDENCE & EXTERNAL INTEGRATIONS (Day 3)

#### 9. Qwen/Featherless Integration
```typescript
// backend/services/qwen.ts
async function extractParameterEvidence(
  paper_text: string,
  material: string,
  parameter: string
): Promise<ParameterEvidence> {
  // Call Featherless API with Qwen
  // Use extraction schema from research doc §19
  // Return structured evidence
}
```

#### 10. Firecrawl Integration
```typescript
// backend/services/firecrawl.ts
async function searchLiterature(
  query: string
): Promise<PaperMetadata[]> {
  // Use Firecrawl to retrieve papers
  // Extract DOI, authors, year, title
  // Return list for Qwen extraction
}
```

#### 11. Wolfram Integration (Optional)
```typescript
// backend/services/wolfram.ts
async function verifyPDE(
  equation: string,
  boundary_conditions: string,
  params: any
): Promise<WolframResult> {
  // Use Wolfram API to solve same PDE
  // Compare against our solver
  // Return cross-validation metrics
}
```

---

### P3 — UI/UX POLISH (Day 4)

#### 12. Integrate Stitch Design
- Current UI is close but not pixel-perfect
- Apply Stitch color palette, typography, spacing
- Match "Corporate Modern with Technical Edge" aesthetic
- Ensure all states: loading, error, empty, success

#### 13. Scientific Evidence UI
- Parameter inspector shows provenance
- Evidence status chips everywhere
- "Why did this happen?" explanation panel
- Traceable from result → parameter → paper

#### 14. Comparison View
- Side-by-side: Physics Solver | Data-only ML | PINN
- Error heatmaps
- Metrics table
- PDE residual visualization

---

### P4 — DEPLOYMENT (Day 5)

#### 15. Docker Configuration
```yaml
# docker-compose.yml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    environment:
      - VITE_API_URL=http://backend:8000
  
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - FEATHERLESS_API_KEY=${FEATHERLESS_API_KEY}
      - FIRECRAWL_API_KEY=${FIRECRAWL_API_KEY}
      - WOLFRAM_APP_ID=${WOLFRAM_APP_ID}
    volumes:
      - ./data:/app/data
```

#### 16. Environment Variables
```bash
# .env.example
FEATHERLESS_API_KEY=your_key_here
FEATHERLESS_MODEL=Qwen/Qwen2.5-72B-Instruct
FIRECRAWL_API_KEY=your_key_here
WOLFRAM_APP_ID=your_id_here  # Optional
DATABASE_URL=sqlite:///data/dermatherm.db
```

#### 17. Deployment Targets
- **Frontend:** Vercel, Netlify, or Render static
- **Backend:** Render, Railway, or Fly.io  
- **Database:** SQLite (file-based) or PostgreSQL

---

## VERIFICATION CHECKLIST

### Before claiming "complete":
- [ ] Frontend starts and connects to backend
- [ ] Backend starts and serves API
- [ ] Material CRUD operations work
- [ ] Experiment configuration saves
- [ ] Simulation runs in browser
- [ ] Results POST to backend successfully
- [ ] 2D T and C_v fields display correctly
- [ ] Units shown on all values
- [ ] Material parameters have provenance
- [ ] Evidence status visible
- [ ] PINN benchmark still works
- [ ] Coupled PINN training runs (even if simplified)
- [ ] Physics vs ML comparison generates
- [ ] No secrets in git
- [ ] .env.example present
- [ ] Docker compose starts
- [ ] README has local setup
- [ ] README explains limitations
- [ ] Health check endpoint works

---

## SCIENTIFIC CORRECTNESS PRIORITIES

1. ✅ **Real simulation output** — NOT fake heatmaps
2. ✅ **Provenance tracking** — Every parameter has status + source
3. ✅ **Honest limitations** — Display L-01...L-13 prominently  
4. ✅ **Verification chain** — V1 analytical → V2 grid convergence → V3 PINN vs solver
5. ✅ **No medical claims** — Clear disclaimers everywhere

---

## CRITICAL: WHAT TO PRESERVE

The existing codebase already has:
- ✅ 2D solver with real physics (§13)
- ✅ PINN benchmark with exact AD (§14)
- ✅ Scientific dossier with equations (dossierA/B)
- ✅ Material evidence schema (in UI)
- ✅ Limitation register (§20)

**DO NOT:**
- Replace the working solver with a fake one
- Remove scientific rigor for visual polish
- Claim validation that doesn't exist
- Hide assumptions
- Fabricate results

**PROCEED TO IMPLEMENTATION**

Next: Create backend structure, then connect frontend.
