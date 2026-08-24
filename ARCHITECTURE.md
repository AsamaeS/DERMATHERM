# 🏗️ DERMATHERM — Architecture Technique

## Vue d'Ensemble du Système

```
╔══════════════════════════════════════════════════════════════════════════╗
║                        DERMATHERM PLATFORM                               ║
║                  Recherche en Transport Thermique Couplé                 ║
╚══════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────┐
│                          🖥️  FRONTEND (React)                            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────┐     │
│  │  📊 Simulation  │  │  🧠 PINN        │  │  👁️  Observation   │     │
│  │                 │  │                 │  │                    │     │
│  │  • Solveur 2D   │  │  • Benchmark    │  │  • YouCam API      │     │
│  │  • FTCS couplé  │  │  • Validation   │  │  • Analyse image   │     │
│  │  • 56×140 grid  │  │  • AD exact     │  │  • Disclaimer      │     │
│  │  • CFL-limité   │  │  • Comparaison  │  │  • Séparation      │     │
│  │                 │  │    Analyt/ML/FD │  │    concerns        │     │
│  └─────────────────┘  └─────────────────┘  └────────────────────┘     │
│                                                                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────────┐     │
│  │  📚 Matériaux   │  │  🧪 Expériences │  │  📖 Documentation  │     │
│  │                 │  │                 │  │                    │     │
│  │  • Registry     │  │  • Lifecycle    │  │  • Dossier 26§     │     │
│  │  • Provenance   │  │  • Config       │  │  • Limitations     │     │
│  │  • Filtres      │  │  • Results      │  │  • Methodology     │     │
│  │  • Evidence     │  │  • Export       │  │  • References      │     │
│  └─────────────────┘  └─────────────────┘  └────────────────────┘     │
│                                                                          │
│                         Vite Dev Server (5173)                           │
│                         Build: Static Assets                             │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/REST
                                    │ CORS Enabled
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       🔧 BACKEND (Node.js + Express)                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                       REST API LAYER                              │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │                                                                   │  │
│  │  GET    /api/health              → Service status                │  │
│  │  GET    /api/materials           → List materials                │  │
│  │  POST   /api/materials           → Create material               │  │
│  │  GET    /api/experiments         → List experiments              │  │
│  │  POST   /api/experiments         → Create experiment             │  │
│  │  POST   /api/experiments/:id/results → Save results              │  │
│  │  POST   /api/evidence/extract    → Qwen extraction               │  │
│  │  POST   /api/literature/search   → Firecrawl search              │  │
│  │  POST   /api/youcam/analyze      → Skin observation              │  │
│  │                                                                   │  │
│  │  Middleware: CORS, JSON Parser, Error Handler, Zod Validation    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────────┐   │
│  │   💾 SQLite  │   │  🤖 Qwen AI  │   │  🔍 Firecrawl            │   │
│  │              │   │              │   │                          │   │
│  │  • Materials │   │  • Parameter │   │  • Literature search     │   │
│  │  • Experiments│   │    extract   │   │  • Paper retrieval       │   │
│  │  • ML Models │   │  • Literature│   │  • Citation extraction   │   │
│  │  • Evidence  │   │    mining    │   │                          │   │
│  │  • Auto init │   │  • Featherless│  │  • API integration       │   │
│  └──────────────┘   └──────────────┘   └──────────────────────────┘   │
│                                                                          │
│                        Port 8000 • Health Checks                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Architecture de Données

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          BASE DE DONNÉES SQLite                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  TABLE: materials                                              │    │
│  ├───────────────────────────────────────────────────────────────┤    │
│  │  id (PK)              TEXT    "MAT-REF-01"                     │    │
│  │  name                 TEXT    "Cotton plain weave"            │    │
│  │  category             TEXT    "Natural textile"               │    │
│  │  parameters           JSON    {                               │    │
│  │                                thermal_conductivity: {         │    │
│  │                                  value: 0.045,                 │    │
│  │                                  unit: "W/m·K",               │    │
│  │                                  status: "LITERATURE-SUPPORTED"│    │
│  │                                  source: "Handbook p.142",    │    │
│  │                                  confidence: "REPORTED"        │    │
│  │                                }                               │    │
│  │                              }                                 │    │
│  │  created_at           TEXT    ISO 8601                        │    │
│  │  updated_at           TEXT    ISO 8601                        │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                 │                                       │
│                                 │ FOREIGN KEY                          │
│                                 ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  TABLE: experiments                                            │    │
│  ├───────────────────────────────────────────────────────────────┤    │
│  │  id (PK)              TEXT    "EXP-001"                       │    │
│  │  name                 TEXT    "Extreme heatwave"              │    │
│  │  status               TEXT    CONFIGURED|RUNNING|COMPLETED    │    │
│  │  material_id (FK)     TEXT    → materials.id                  │    │
│  │  climate              JSON    {T_amb, RH, v_air, T_skin}     │    │
│  │  parameters           JSON    Material snapshot               │    │
│  │  solver               JSON    {type, grid, timestep, CFL}     │    │
│  │  results              JSON    {fields, metrics, timestamp}    │    │
│  │  limitations          JSON    ["L-01", "L-02", ...]          │    │
│  │  assumptions          JSON    [...]                          │    │
│  │  research_question    TEXT    Optional                        │    │
│  │  created_at           TEXT    ISO 8601                        │    │
│  │  updated_at           TEXT    ISO 8601                        │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  TABLE: ml_models                                              │    │
│  ├───────────────────────────────────────────────────────────────┤    │
│  │  id (PK)              TEXT    "MODEL-001"                     │    │
│  │  name                 TEXT    "PINN coupled 2D"               │    │
│  │  type                 TEXT    "PINN" | "DATA_ONLY"           │    │
│  │  architecture         JSON    {layers, neurons, activation}   │    │
│  │  training_config      JSON    {epochs, lr, optimizer}         │    │
│  │  trained_on           JSON    ["EXP-001", "EXP-002"]         │    │
│  │  metrics              JSON    {rmse, rel_l2, pde_residual}   │    │
│  │  created_at           TEXT    ISO 8601                        │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │  TABLE: literature_evidence                                    │    │
│  ├───────────────────────────────────────────────────────────────┤    │
│  │  id (PK)              TEXT    "LIT-001"                       │    │
│  │  paper                TEXT    "Textile Handbook 2023"         │    │
│  │  authors              JSON    ["Smith J.", "Doe A."]         │    │
│  │  year                 TEXT    "2023"                          │    │
│  │  doi                  TEXT    "10.xxxx/xxxxx"                 │    │
│  │  material             TEXT    "Cotton fabric"                 │    │
│  │  parameter            TEXT    "thermal_conductivity"          │    │
│  │  value                TEXT    "0.045"                         │    │
│  │  unit                 TEXT    "W/m·K"                        │    │
│  │  experimental_conditions TEXT "20°C, 65% RH, still air"      │    │
│  │  source_quote         TEXT    Original citation               │    │
│  │  confidence           TEXT    MEASURED|REPORTED|DERIVED       │    │
│  │  created_at           TEXT    ISO 8601                        │    │
│  └───────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Flux de Simulation

```
                         🎬 DÉMARRAGE SIMULATION
                                  │
                                  ▼
        ┌──────────────────────────────────────────────┐
        │  1️⃣  CONFIGURATION                           │
        ├──────────────────────────────────────────────┤
        │  • Sélection matériau (MAT-A-01)            │
        │  • Conditions climat (T=42°C, RH=85%)       │
        │  • Scénario (plain-weave-heterogeneous)     │
        │  • Hotspot transpiration (oui/non)          │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  2️⃣  INITIALISATION                          │
        ├──────────────────────────────────────────────┤
        │  • Grille 56×140 (Δx=0.02mm)                │
        │  • Calcul Δt avec critère CFL               │
        │  • Conditions initiales T(x,y,0), W(x,y,0)  │
        │  • Allocation mémoire champs                │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  3️⃣  BOUCLE TEMPORELLE                       │
        ├──────────────────────────────────────────────┤
        │  Pour t = 0 → t_final :                     │
        │                                              │
        │    ┌─────────────────────────────────┐      │
        │    │ 3a. Diffusion thermique         │      │
        │    │     T^(n+1) = f(∇²T^n, E^n)    │      │
        │    └─────────────────────────────────┘      │
        │              │                               │
        │              ▼                               │
        │    ┌─────────────────────────────────┐      │
        │    │ 3b. Diffusion humidité          │      │
        │    │     W^(n+1) = f(∇²W^n, E^n)    │      │
        │    └─────────────────────────────────┘      │
        │              │                               │
        │              ▼                               │
        │    ┌─────────────────────────────────┐      │
        │    │ 3c. Évaporation couplée         │      │
        │    │     E = f(T, W, P_sat)          │      │
        │    └─────────────────────────────────┘      │
        │              │                               │
        │              ▼                               │
        │    ┌─────────────────────────────────┐      │
        │    │ 3d. Conditions limites          │      │
        │    │     T_top, W_top, T_bot, W_bot  │      │
        │    └─────────────────────────────────┘      │
        │              │                               │
        │              ▼                               │
        │    ┌─────────────────────────────────┐      │
        │    │ 3e. Audit conservation          │      │
        │    │     Δmasse < 1%                 │      │
        │    └─────────────────────────────────┘      │
        │                                              │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  4️⃣  CALCUL MÉTRIQUES                        │
        ├──────────────────────────────────────────────┤
        │  • Taux évaporation : ∫∫ E dA               │
        │  • Refroidissement latent : L × E           │
        │  • Température surface : T(x, y_surface)    │
        │  • Erreur conservation : |Δm_total|         │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  5️⃣  VISUALISATION                           │
        ├──────────────────────────────────────────────┤
        │  • Heatmap température (Canvas 2D)          │
        │  • Heatmap humidité (Canvas 2D)             │
        │  • Courbes métriques vs temps               │
        │  • Affichage diagnostics                    │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  6️⃣  SAUVEGARDE (Optionnel)                  │
        ├──────────────────────────────────────────────┤
        │  POST /api/experiments/:id/results          │
        │  {                                           │
        │    fields: {T[][], W[][]},                  │
        │    metrics: {...},                          │
        │    timestamp: ISO8601                       │
        │  }                                           │
        └──────────────────────────────────────────────┘
                           │
                           ▼
                      ✅ FIN
```

---

## Pipeline PINN

```
                         🧠 PINN BENCHMARK WORKFLOW
                                  │
                                  ▼
        ┌──────────────────────────────────────────────┐
        │  1️⃣  SOLUTION ANALYTIQUE                     │
        ├──────────────────────────────────────────────┤
        │  Équation : ∂u/∂t = α·∇²u                  │
        │  Conditions : u(0,t)=0, u(L,t)=0, u(x,0)=sin│
        │  Solution exacte :                           │
        │    u(x,t) = sin(πx/L) · exp(-α(π/L)²t)     │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  2️⃣  GÉNÉRATION DONNÉES                      │
        ├──────────────────────────────────────────────┤
        │  • Grille spatiotemporelle (x,t)            │
        │  • 100 points × 50 timesteps                │
        │  • u_exact calculé pour chaque (x,t)        │
        │  • Split : 70% train / 30% test             │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  3️⃣  ARCHITECTURE MLP                        │
        ├──────────────────────────────────────────────┤
        │  Input Layer:  [x, t]  → 2 neurons          │
        │  Hidden 1:     tanh    → 20 neurons         │
        │  Hidden 2:     tanh    → 20 neurons         │
        │  Output:       linear  → 1 neuron (u)       │
        │                                              │
        │  Paramètres : ~500                          │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  4️⃣  DIFFÉRENTIATION AUTOMATIQUE             │
        ├──────────────────────────────────────────────┤
        │  Forward Pass (Jets) :                       │
        │    u_net(x,t) → [u, ∂u/∂x, ∂u/∂t, ∇²u]    │
        │                                              │
        │  Résidu PDE :                                │
        │    R = ∂u/∂t - α·∇²u                       │
        │                                              │
        │  Loss Function :                             │
        │    L = λ_pde·||R||² +                       │
        │        λ_data·||u_net - u_exact||² +        │
        │        λ_bc·||BC_error||² +                 │
        │        λ_ic·||IC_error||²                   │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  5️⃣  OPTIMISATION (Adam)                     │
        ├──────────────────────────────────────────────┤
        │  Pour epoch = 1 → 1000 :                    │
        │    • Mini-batch (32 samples)                │
        │    • Calcul gradients ∂L/∂θ (backprop)     │
        │    • Update : θ ← θ - lr·m̂/(√v̂ + ε)      │
        │    • Log métriques                          │
        │                                              │
        │  Early stopping : pde_residual < 1e-4       │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  6️⃣  VALIDATION                              │
        ├──────────────────────────────────────────────┤
        │  Test Set Métriques :                        │
        │    • RMSE = √(1/N·Σ(u_net - u_exact)²)     │
        │    • rel-L2 = ||u_net - u_exact||/||u_exact||│
        │    • PDE residual = ||∂u/∂t - α·∇²u||      │
        │                                              │
        │  Comparaison :                               │
        │    [Analytical] vs [PINN] vs [Finite Diff]  │
        └──────────────────┬───────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────────┐
        │  7️⃣  VISUALISATION                           │
        ├──────────────────────────────────────────────┤
        │  • Courbe u(x) à t fixé (3 méthodes)        │
        │  • Courbe d'apprentissage (loss vs epoch)   │
        │  • Heatmap erreur spatiale                  │
        │  • Affichage métriques finales              │
        └──────────────────────────────────────────────┘
                           │
                           ▼
                      ✅ VALIDATION RÉUSSIE
```

---

## Intégration Services Externes

```
┌────────────────────────────────────────────────────────────────────┐
│                      SERVICES EXTERNES (API)                       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  🤖 QWEN (Featherless AI)                                 │   │
│  ├───────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  Entrée : Texte article scientifique                      │   │
│  │           "The thermal conductivity of cotton..."         │   │
│  │                                                            │   │
│  │  Prompt : "Extract material parameters with units,        │   │
│  │            values, experimental conditions, and           │   │
│  │            confidence level..."                           │   │
│  │                                                            │   │
│  │  Sortie : JSON structuré                                  │   │
│  │  {                                                         │   │
│  │    material: "Cotton fabric",                             │   │
│  │    parameters: {                                          │   │
│  │      thermal_conductivity: {                              │   │
│  │        value: 0.045,                                      │   │
│  │        unit: "W/m·K",                                    │   │
│  │        conditions: "20°C, still air",                    │   │
│  │        confidence: "REPORTED"                             │   │
│  │      }                                                     │   │
│  │    }                                                       │   │
│  │  }                                                         │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  🔍 FIRECRAWL                                             │   │
│  ├───────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  Entrée : Query                                           │   │
│  │           "textile thermal conductivity measurement"      │   │
│  │                                                            │   │
│  │  Process :                                                │   │
│  │    1. Web crawl (Google Scholar, PubMed, arXiv)         │   │
│  │    2. Extract metadata (title, authors, DOI)             │   │
│  │    3. Download abstracts/full text                       │   │
│  │    4. Rank by relevance                                  │   │
│  │                                                            │   │
│  │  Sortie : Array de papers                                │   │
│  │  [                                                         │   │
│  │    {                                                       │   │
│  │      title: "Thermal properties of textiles",            │   │
│  │      authors: ["Smith J.", "Doe A."],                   │   │
│  │      year: 2023,                                         │   │
│  │      doi: "10.xxxx/xxxxx",                               │   │
│  │      abstract: "...",                                    │   │
│  │      url: "https://..."                                  │   │
│  │    }                                                       │   │
│  │  ]                                                         │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │  👁️  YOUCAM API                                           │   │
│  ├───────────────────────────────────────────────────────────┤   │
│  │                                                            │   │
│  │  ⚠️  MODULE SÉPARÉ — OBSERVATION UNIQUEMENT               │   │
│  │                                                            │   │
│  │  Entrée : Image base64                                    │   │
│  │           data:image/jpeg;base64,/9j/4AAQ...              │   │
│  │                                                            │   │
│  │  Process :                                                │   │
│  │    1. Image analysis (CV models)                         │   │
│  │    2. Feature extraction                                 │   │
│  │    3. Confidence scoring                                 │   │
│  │                                                            │   │
│  │  Sortie : Observations descriptives                      │   │
│  │  {                                                         │   │
│  │    skin_tone: {value: "Fair", confidence: 0.87},        │   │
│  │    moisture_level: {value: "Normal", confidence: 0.92}, │   │
│  │    texture_analysis: {                                   │   │
│  │      smoothness: 0.73,                                   │   │
│  │      roughness: 0.31,                                    │   │
│  │      confidence: 0.85                                    │   │
│  │    },                                                     │   │
│  │    disclaimer: "OBSERVATION ONLY - NOT DIAGNOSIS"        │   │
│  │  }                                                         │   │
│  │                                                            │   │
│  │  ❌ NE FAIT PAS : diagnostic, prédiction, causality      │   │
│  └───────────────────────────────────────────────────────────┘   │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Déploiement Docker

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOCKER ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🐳 docker-compose.yml                                 │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  services:                                              │   │
│  │                                                         │   │
│  │    ┌──────────────────────────────────────────────┐   │   │
│  │    │  frontend:                                    │   │   │
│  │    │    build: Dockerfile.frontend                │   │   │
│  │    │    ports: "3000:80"                          │   │   │
│  │    │    depends_on: [backend]                     │   │   │
│  │    │    environment:                               │   │   │
│  │    │      - VITE_API_URL=http://backend:8000     │   │   │
│  │    └──────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │    ┌──────────────────────────────────────────────┐   │   │
│  │    │  backend:                                     │   │   │
│  │    │    build: Dockerfile.backend                 │   │   │
│  │    │    ports: "8000:8000"                        │   │   │
│  │    │    volumes:                                   │   │   │
│  │    │      - ./backend/data:/app/data             │   │   │
│  │    │    environment:                               │   │   │
│  │    │      - NODE_ENV=production                   │   │   │
│  │    │      - FEATHERLESS_API_KEY=${KEY}           │   │   │
│  │    │    healthcheck:                               │   │   │
│  │    │      test: curl -f http://localhost:8000/api/│   │   │
│  │    │            health || exit 1                  │   │   │
│  │    │      interval: 30s                           │   │   │
│  │    │      timeout: 10s                            │   │   │
│  │    │      retries: 3                              │   │   │
│  │    └──────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📦 Dockerfile.frontend (Multi-stage)                  │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  Stage 1: Build                                        │   │
│  │    FROM node:20-alpine AS builder                     │   │
│  │    COPY package*.json ./                               │   │
│  │    RUN npm ci                                          │   │
│  │    COPY . .                                            │   │
│  │    RUN npm run build                                   │   │
│  │                                                         │   │
│  │  Stage 2: Serve                                        │   │
│  │    FROM nginx:alpine                                   │   │
│  │    COPY --from=builder /app/dist /usr/share/nginx/html│   │
│  │    COPY nginx.conf /etc/nginx/nginx.conf              │   │
│  │    EXPOSE 80                                           │   │
│  │                                                         │   │
│  │  Image finale : ~25 MB                                │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📦 Dockerfile.backend                                 │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  FROM node:20-alpine                                   │   │
│  │  RUN apk add --no-cache python3 make g++              │   │
│  │  WORKDIR /app                                          │   │
│  │  COPY backend/package*.json ./                         │   │
│  │  RUN npm ci --only=production                          │   │
│  │  COPY backend/ ./                                      │   │
│  │  RUN npm run build                                     │   │
│  │  RUN adduser -D -u 1001 appuser                       │   │
│  │  USER appuser                                          │   │
│  │  EXPOSE 8000                                           │   │
│  │  CMD ["node", "dist/server.js"]                       │   │
│  │                                                         │   │
│  │  Image finale : ~150 MB                               │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sécurité et Bonnes Pratiques

```
┌─────────────────────────────────────────────────────────────────┐
│                      COUCHES DE SÉCURITÉ                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔒 Niveau 1 : Variables d'Environnement                       │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ • .env.example fourni (pas de secrets hardcodés)        │  │
│  │ • .gitignore empêche commit de .env                     │  │
│  │ • Validation au démarrage                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🛡️  Niveau 2 : Validation des Entrées (Zod)                  │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ • Schémas TypeScript stricts                            │  │
│  │ • Validation côté backend (pas de confiance client)    │  │
│  │ • Sanitization automatique                              │  │
│  │ • Messages d'erreur clairs (pas de stack trace prod)   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🌐 Niveau 3 : CORS et Limites                                 │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ • CORS configuré (origine whitelistée)                  │  │
│  │ • Request size limit : 50MB                             │  │
│  │ • Rate limiting (TODO)                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🐳 Niveau 4 : Docker Isolation                                │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ • Non-root user (UID 1001)                              │  │
│  │ • Network isolation                                     │  │
│  │ • Volume mounts limités                                 │  │
│  │ • Health checks                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  📊 Niveau 5 : Monitoring                                      │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ • Health endpoint (/api/health)                         │  │
│  │ • Error logging (production mode)                       │  │
│  │ • Service status tracking                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Performance et Optimisation

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPTIMISATIONS APPLIQUÉES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🚀 Frontend                                                    │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ • Vite : HMR ultra-rapide en dev                        │  │
│  │ • Tree-shaking en production                            │  │
│  │ • Code splitting automatique                            │  │
│  │ • Canvas rendering (pas de DOM pour heatmaps)          │  │
│  │ • useMemo pour calculs coûteux                         │  │
│  │ • Lazy loading des composants                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ⚡ Backend                                                     │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ • SQLite : pas de réseau, accès direct                 │  │
│  │ • Index sur clés primaires                              │  │
│  │ • Prepared statements                                   │  │
│  │ • JSON serialization optimisée                          │  │
│  │ • Async/await partout                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🧮 Simulation                                                  │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ • TypedArrays (Float64Array) au lieu d'arrays JS       │  │
│  │ • Boucles optimisées (pas de .map/.filter)             │  │
│  │ • Calculs en place (pas de copy inutiles)              │  │
│  │ • Timestep adaptatif (CFL)                              │  │
│  │ • Web Workers potentiels (TODO)                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Benchmarks (sur Intel i5, 8GB RAM) :                          │
│  • Frontend build : ~15s                                       │
│  • Backend start : ~2s                                         │
│  • Simulation 56×140 (1000 steps) : ~5s                       │
│  • PINN training (1000 epochs) : ~30s                          │
│  • API response time : <100ms                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Évolutions Futures

```
┌─────────────────────────────────────────────────────────────────┐
│                        ROADMAP (v2.0)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📈 Phase 1 : Validation Scientifique                           │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ □ PINN 2D couplé (température + humidité)              │  │
│  │ □ Validation expérimentale avec données réelles        │  │
│  │ □ Convergence de grille                                 │  │
│  │ □ Vérification Wolfram                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🏗️  Phase 2 : Features Avancées                               │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ □ Géométrie 3D avec maillage adaptatif                 │  │
│  │ □ Propriétés dépendantes (T, W)                        │  │
│  │ □ Rayonnement thermique                                 │  │
│  │ □ Convection forcée locale                              │  │
│  │ □ Multi-couches textiles                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  💾 Phase 3 : Infrastructure                                    │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ □ Migration PostgreSQL (multi-user)                    │  │
│  │ □ Authentication (JWT)                                  │  │
│  │ □ Rate limiting                                         │  │
│  │ □ WebSocket pour simulation temps réel                 │  │
│  │ □ Export PDF avec visualisations                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🧪 Phase 4 : Tests et CI/CD                                    │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ □ Tests unitaires complets (>80% coverage)            │  │
│  │ □ Tests d'intégration (API + DB)                       │  │
│  │ □ GitHub Actions CI/CD                                  │  │
│  │ □ Benchmarks automatisés                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🎨 Phase 5 : UX/UI                                             │
│  ├─────────────────────────────────────────────────────────┐  │
│  │ □ Design system complet (Stitch)                       │  │
│  │ □ Animations fluides                                    │  │
│  │ □ Mode sombre                                           │  │
│  │ □ Internationalisation (i18n)                           │  │
│  │ □ Accessibilité WCAG AA                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

<div align="center">

**[⬆ Retour au README principal](README.md)**

Construit avec rigueur scientifique et excellence technique

</div>
