# 🔬 DERMATHERM

### Plateforme de Recherche en Transport Thermique et Hydrique Couplé

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed)](https://www.docker.com/)

> **Prototype de recherche** pour la simulation physique des transferts de chaleur et d'humidité dans les textiles sous conditions climatiques extrêmes. **Non destiné à un usage médical ou de certification.**

---

## 📋 Table des Matières

- [Vue d'Ensemble](#-vue-densemble)
- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [API Documentation](#-api-documentation)
- [Déploiement](#-déploiement)
- [Structure du Projet](#-structure-du-projet)
- [Méthodologie Scientifique](#-méthodologie-scientifique)
- [Limitations](#-limitations)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🎯 Vue d'Ensemble

**DERMATHERM** est une plateforme de recherche qui combine :

- ✅ **Simulation physique réelle** — Solveur FTCS 2D avec audit de conservation
- ✅ **Validation ML** — Réseaux PINN (Physics-Informed Neural Networks)
- ✅ **Traçabilité des preuves** — Provenance complète de chaque paramètre
- ✅ **Backend API** — Persistance et orchestration
- ✅ **Intégrité scientifique** — 13 limitations documentées

### Cas d'Usage

```
┌─────────────────────────────────────────────────────┐
│  RECHERCHE COMPUTATIONNELLE                         │
│  • Screening de matériaux textiles                  │
│  • Analyse de sensibilité paramétrique              │
│  • Validation de modèles physiques vs ML            │
│  • Génération d'hypothèses testables                │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  HORS PÉRIMÈTRE (NON SUPPORTÉ)                      │
│  ✗ Diagnostic médical                               │
│  ✗ Prédiction de confort thermique                  │
│  ✗ Certification de produits                        │
│  ✗ Causalité clinique                               │
└─────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### Approche Hybride : Navigateur + Backend

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                  │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  Solveur 2D      │  │  PINN Benchmark  │  │  Observation  │ │
│  │  FTCS Couplé     │  │  Validation ML   │  │  Peau YouCam  │ │
│  │  56×140 grille   │  │  AD exact        │  │  (optionnel)  │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│            │                     │                     │         │
│            └─────────────────────┼─────────────────────┘         │
│                                  │                               │
│                            REST API (CORS)                       │
└──────────────────────────────────┼───────────────────────────────┘
                                   │
┌──────────────────────────────────┼───────────────────────────────┐
│                    BACKEND (Node.js + Express)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   SQLite     │  │  Qwen LLM    │  │  YouCam API          │  │
│  │   Database   │  │  (Featherless)│  │  (Skin Observation)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                  │
│  Services:                                                       │
│  • Registre de matériaux avec provenance                        │
│  • Gestion du cycle de vie des expériences                      │
│  • Extraction de littérature scientifique                       │
│  • Recherche d'articles (Firecrawl)                             │
│  • Observation cutanée (YouCam API)                             │
└──────────────────────────────────────────────────────────────────┘
```

### Flux de Données

```
┌─────────────┐
│   Matériau  │  Statut: SUPPORTÉ / ASSUMÉ / NON VÉRIFIÉ
└──────┬──────┘
       │
       v
┌─────────────────────────┐
│  Configuration Climat   │  42°C, 85% RH, 0.4 m/s, hotspot
└──────────┬──────────────┘
           │
           v
    ┌──────────────┐
    │  Simulation  │  Solveur FTCS, grille 56×140, CFL-limité
    │  (Navigateur)│  Conservation audit < 1%
    └──────┬───────┘
           │
           v
    ┌──────────────┐
    │  Résultats   │  Champs T(x,y,t), W(x,y,t), métriques
    └──────┬───────┘
           │
           v
    ┌──────────────┐
    │  Backend API │  POST /api/experiments/:id/results
    └──────┬───────┘
           │
           v
    ┌──────────────┐
    │   SQLite     │  Stockage avec configuration complète
    └──────────────┘
```

---

## ✨ Fonctionnalités

### 🔬 Simulation Physique

- **Solveur FTCS 2D** pour équations de diffusion couplées
- **Grille 56×140** avec pas de temps limité CFL pour stabilité
- **Évaporation interfaciale** avec saturation de Buck
- **Audit de conservation** : erreur de masse < 1%
- **Conductivités harmoniques** aux interfaces
- **Conditions aux limites** : température/humidité imposées

### 🧠 Validation ML (PINN)

- **Différentiation automatique exacte** (forward jets + accumulation inverse)
- **Architecture MLP** : 2 couches × 20 neurones, activation tanh
- **Fonction de perte** : Résidu PDE + données + BC/IC
- **Optimiseur Adam** avec taux d'apprentissage configurable
- **Comparaison** : Solution analytique vs PINN vs Différences finies
- **Métriques** : RMSE, rel-L2, norme du résidu PDE

### 📊 Registre de Matériaux

- CRUD complet avec validation Zod
- Statut de preuve pour chaque paramètre :
  - `LITERATURE-SUPPORTED` — Référence vérifiable
  - `ASSUMED / DEMONSTRATION` — Hypothèse déclarée
  - `NOT VERIFIED` — En attente de caractérisation
- Citation de source pour chaque valeur
- Niveau de confiance : MEASURED | REPORTED | DERIVED | ASSUMED

### 🧪 Gestion d'Expériences

- Cycle de vie : `CONFIGURED` → `RUNNING` → `COMPLETED` | `FAILED`
- Snapshot complet de configuration (reproductibilité)
- Stockage des résultats avec horodatage
- Export JSON des expériences
- Association matériau-expérience avec traçabilité

### 🤖 Services IA

- **Qwen (Featherless)** : Extraction de paramètres depuis articles
- **Firecrawl** : Recherche d'articles scientifiques
- **YouCam API** : Observation cutanée descriptive (module séparé)

### 👁️ Observation Cutanée (Optionnel)

- Analyse d'images via YouCam API
- **Séparation stricte** : OBSERVATION ≠ SIMULATION ≠ DIAGNOSTIC
- Disclaimer obligatoire dans l'interface
- Aucune prétention médicale

---

## 🚀 Installation

### Prérequis

- **Node.js** 20+ ([télécharger](https://nodejs.org/))
- **npm** 10+ (inclus avec Node.js)
- **Docker** (optionnel, pour déploiement) ([télécharger](https://www.docker.com/))

### Installation Rapide

```bash
# 1. Cloner le repository
git clone https://github.com/AsamaeS/DERMATHERM.git
cd DERMATHERM

# 2. Copier le fichier d'environnement
cp .env.example .env

# 3. Configurer les clés API dans .env (optionnel)
# FEATHERLESS_API_KEY=votre_clé
# FIRECRAWL_API_KEY=votre_clé
# YOUCAM_API_KEY=votre_clé

# 4. Installer les dépendances
npm install
cd backend && npm install && cd ..

# 5. Démarrer en mode développement
npm run dev        # Frontend (terminal 1)
cd backend && npm run dev  # Backend (terminal 2)
```

### Démarrage Automatisé

**Windows :**
```bash
start-dev.bat
```

**Linux/Mac :**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Accès

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:8000
- **Health Check** : http://localhost:8000/api/health

---

## 💻 Utilisation

### 1. Explorer le Registre de Matériaux

```
Interface Web → Materials Registry
• Filtrer par statut de preuve
• Inspecter les paramètres thermiques
• Voir la provenance complète
```

### 2. Configurer une Simulation

```
Interface Web → Simulation
• Choisir un matériau
• Définir les conditions climatiques :
  - Température ambiante (°C)
  - Humidité relative (%)
  - Vitesse de l'air (m/s)
  - Hotspot de transpiration (bool)
• Cliquer "Run solver"
```

### 3. Observer les Résultats

```
• Champ de température T(x,y) en temps réel
• Champ d'humidité W(x,y) en temps réel
• Métriques :
  - Taux d'évaporation (kg/m²·s)
  - Refroidissement latent (W/m²)
  - Température de surface (°C)
  - Erreur de conservation (%)
```

### 4. Valider avec PINN

```
Interface Web → PINN Benchmark
• Comparer Solution analytique / PINN / FD
• Inspecter les courbes d'apprentissage
• Vérifier le résidu PDE
• Métriques RMSE et rel-L2
```

### 5. Enregistrer l'Expérience

```
Backend API : POST /api/experiments
{
  "name": "Canicule humide extrême",
  "climate": {"T_amb": 42, "RH": 85, ...},
  "material_id": "MAT-A-01",
  "scenario": "plain-weave-heterogeneous"
}
```

---

## 📡 API Documentation

### Health Check

```http
GET /api/health
```

**Réponse :**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "operational",
    "qwen": "operational",
    "firecrawl": "operational",
    "youcam": "operational"
  }
}
```

### Matériaux

#### Lister tous les matériaux
```http
GET /api/materials
```

#### Récupérer un matériau
```http
GET /api/materials/:id
```

#### Créer un matériau
```http
POST /api/materials
Content-Type: application/json

{
  "name": "Cotton plain weave",
  "category": "Natural textile",
  "parameters": {
    "thermal_conductivity": {
      "value": 0.045,
      "unit": "W/m·K",
      "status": "LITERATURE-SUPPORTED",
      "source": "Textile Handbook 2023, p.142",
      "confidence": "REPORTED"
    }
  }
}
```

### Expériences

#### Créer une expérience
```http
POST /api/experiments
Content-Type: application/json

{
  "name": "Extreme humid heatwave",
  "description": "42°C, 85% RH, plain weave",
  "climate": {
    "T_amb": 42,
    "RH": 85,
    "v_air": 0.4,
    "T_skin": 34
  },
  "material_id": "MAT-A-01",
  "scenario": "plain-weave-heterogeneous",
  "hotspot": true
}
```

#### Mettre à jour le statut
```http
PATCH /api/experiments/:id/status
Content-Type: application/json

{
  "status": "RUNNING"
}
```

#### Enregistrer les résultats
```http
POST /api/experiments/:id/results
Content-Type: application/json

{
  "fields": {
    "temperature": [[...]], 
    "moisture": [[...]]
  },
  "metrics": {
    "evaporation_rate": 1.2e-5,
    "latent_cooling": 28.5,
    "surface_temperature": 33.4,
    "conservation_error": 0.0043
  }
}
```

### Services IA

#### Extraire des paramètres (Qwen)
```http
POST /api/evidence/extract
Content-Type: application/json

{
  "text": "The thermal conductivity of cotton fabric ranges from 0.03 to 0.06 W/m·K..."
}
```

#### Rechercher des articles (Firecrawl)
```http
POST /api/literature/search
Content-Type: application/json

{
  "query": "textile thermal conductivity cotton",
  "limit": 10
}
```

#### Analyser une image cutanée (YouCam)
```http
POST /api/youcam/analyze
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,...",
  "analysis_type": "observation"
}
```

---

## 🐳 Déploiement

### Docker (Production)

```bash
# 1. Copier et configurer .env
cp .env.example .env

# 2. Construire et démarrer
docker-compose up -d

# 3. Vérifier les services
docker-compose ps
curl http://localhost:8000/api/health

# 4. Voir les logs
docker-compose logs -f

# 5. Arrêter
docker-compose down
```

### Déploiement Cloud

#### Option 1 : Vercel (Frontend) + Render (Backend)

**Frontend sur Vercel :**
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod

# Configurer la variable d'environnement
# VITE_API_URL=https://votre-backend.onrender.com
```

**Backend sur Render :**
1. Créer un nouveau Web Service
2. Connecter le repository GitHub
3. Configuration :
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Ajouter un Persistent Disk : `/app/backend/data`
4. Ajouter les variables d'environnement

#### Option 2 : Railway (Full Stack)

```bash
# Installer Railway CLI
npm i -g @railway/cli

# Déployer
railway up
```

#### Option 3 : Docker sur VPS

```bash
# Sur votre serveur
git clone https://github.com/AsamaeS/DERMATHERM.git
cd DERMATHERM
cp .env.example .env
# Configurer .env
docker-compose up -d
```

---

## 📁 Structure du Projet

```
DERMATHERM/
│
├── src/                           # Frontend React
│   ├── components/
│   │   ├── Simulator.tsx         # Solveur 2D FTCS
│   │   ├── PinnBench.tsx         # Benchmark PINN
│   │   ├── SkinObservation.tsx   # Module YouCam
│   │   ├── Masthead.tsx          # En-tête
│   │   └── ui.tsx                # Composants UI
│   ├── lib/
│   │   ├── solver.ts             # Logique du solveur physique
│   │   ├── pinn.ts               # Implémentation PINN
│   │   └── api.ts                # Client API backend
│   ├── data/
│   │   ├── dossierA.tsx          # Dossier scientifique (§01-13)
│   │   ├── dossierB.tsx          # Dossier scientifique (§14-26)
│   │   └── refs.ts               # Références bibliographiques
│   ├── App.tsx                   # Composant principal
│   ├── main.tsx                  # Point d'entrée
│   └── index.css                 # Styles globaux
│
├── backend/                       # Backend Node.js
│   ├── src/
│   │   ├── server.ts             # Serveur Express
│   │   ├── db.ts                 # Configuration SQLite
│   │   ├── types.ts              # Types TypeScript
│   │   ├── seed.ts               # Données initiales
│   │   ├── routes/
│   │   │   ├── health.ts         # Health check
│   │   │   ├── materials.ts      # CRUD matériaux
│   │   │   ├── experiments.ts    # CRUD expériences
│   │   │   ├── ml.ts             # Modèles ML
│   │   │   └── youcam.ts         # YouCam API
│   │   └── services/
│   │       ├── qwen.ts           # Intégration Qwen
│   │       ├── firecrawl.ts      # Recherche articles
│   │       └── youcam.ts         # Service YouCam
│   ├── data/                     # Répertoire SQLite
│   └── package.json
│
├── stitch_dermatherm_thermal_research_platform/
│   ├── DESIGN.md                 # Spécifications design
│   ├── code.html                 # Design system complet
│   └── screen.png                # Capture d'écran
│
├── docker-compose.yml            # Orchestration Docker
├── Dockerfile.backend            # Image backend
├── Dockerfile.frontend           # Image frontend
├── nginx.conf                    # Configuration Nginx
│
├── README.md                     # Ce fichier
├── README_DEPLOYMENT.md          # Guide déploiement détaillé
├── IMPLEMENTATION_PLAN.md        # Décisions d'architecture
├── ENGINEERING_REPORT.md         # Rapport technique
├── YOUCAM_INTEGRATION.md         # Documentation YouCam
├── FINAL_SUMMARY.md              # Résumé du projet
│
├── start-dev.bat                 # Démarrage Windows
├── start-dev.sh                  # Démarrage Linux/Mac
├── .env.example                  # Template variables d'environnement
├── .gitignore                    # Fichiers ignorés
├── package.json                  # Dépendances frontend
├── tsconfig.json                 # Config TypeScript
├── vite.config.js                # Config Vite
└── LICENSE                       # Licence MIT
```

---

## 🔬 Méthodologie Scientifique

### Équations Gouvernantes

**Diffusion thermique :**
```
ρc_p ∂T/∂t = ∇·(k∇T) - L·E
```

**Diffusion d'humidité :**
```
∂W/∂t = ∇·(D∇W) + E
```

Où :
- `T` : température (°C)
- `W` : teneur en eau (kg/kg)
- `k` : conductivité thermique (W/m·K)
- `D` : diffusivité de vapeur (m²/s)
- `E` : taux d'évaporation (kg/m³·s)
- `L` : chaleur latente de vaporisation (J/kg)

### Schéma Numérique

**FTCS (Forward-Time Central-Space) :**
```
T[i,j]^(n+1) = T[i,j]^n + α·Δt·(∇²T)[i,j]^n - (L·E·Δt)/(ρ·c_p)
```

**Critère de stabilité CFL :**
```
Δt ≤ (Δx²)/(4·α)
```
où `α = k/(ρ·c_p)` est la diffusivité thermique.

### Validation PINN

**Loss Function :**
```
L_total = λ_pde·L_pde + λ_data·L_data + λ_bc·L_bc + λ_ic·L_ic
```

**Résidu PDE :**
```
R = ∂u/∂t - α·∇²u
```

**Différentiation automatique :**
- Forward jets pour calcul simultané `u` et `∂u/∂x`
- Reverse accumulation pour `∂L/∂θ`

---

## ⚠️ Limitations

### Limitations Techniques (L-01 à L-13)

| ID | Limitation | Impact |
|----|-----------|--------|
| **L-01** | Paramètres basés sur plages littérature | Incertitude quantitative |
| **L-02** | Modèle couplé non validé expérimentalement | Pas de benchmark physique |
| **L-03** | Benchmark PINN = équation chaleur simplifiée | Validation partielle seulement |
| **L-04** | Hétérogénéité spatiale = scénario computationnel | Pas de textile réel caractérisé |
| **L-05** | Conditions limites figées | Scénarios limités |
| **L-06** | Géométrie 2D rectangulaire | Pas de vêtement 3D |
| **L-07** | Propriétés matérielles constantes | Pas de dépendance T/W |
| **L-08** | Pas de rayonnement | Modèle incomplet |
| **L-09** | Pas de convection forcée locale | Schéma simplifié |
| **L-10** | Pas de validation Wolfram | Pas de vérification externe |
| **L-11** | Tests automatisés incomplets | Couverture partielle |
| **L-12** | API externes optionnelles | Services peuvent échouer |
| **L-13** | Observation cutanée ≠ diagnostic | Aucune prétention médicale |

### Périmètre Hors-Scope

❌ **Ce que cette plateforme NE FAIT PAS :**
- Diagnostic médical de conditions cutanées
- Prédiction de confort thermique personnel
- Certification de performance de produits textiles
- Établissement de causalité entre environnement et santé
- Recommandations de traitement médical

---

## 🧪 Tests

### Tests Unitaires

```bash
# Frontend
npm run test

# Backend
cd backend && npm run test
```

### Tests d'Intégration

```bash
# Démarrer les services
./start-dev.sh

# Tester l'API
curl http://localhost:8000/api/health

# Tester le frontend
open http://localhost:5173
```

### Validation Scientifique

1. **Conservation de masse** : Erreur < 1%
2. **Stabilité CFL** : Pas de temps adaptatif
3. **Benchmark analytique** : PINN vs solution exacte
4. **Convergence de grille** : Vérifier indépendance au maillage

---

## 🤝 Contribution

Les contributions sont bienvenues ! Veuillez suivre ces étapes :

1. **Fork** le projet
2. **Créer une branche** : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Commit** : `git commit -m "Ajout d'une nouvelle fonctionnalité"`
4. **Push** : `git push origin feature/nouvelle-fonctionnalite`
5. **Pull Request** avec description détaillée

### Guidelines

- Respecter l'intégrité scientifique (pas de fausses données)
- Documenter toutes les limitations
- Ajouter des tests pour les nouvelles fonctionnalités
- Suivre les conventions TypeScript/React existantes
- Maintenir la traçabilité des paramètres

---

## 📚 Documentation Complémentaire

- [Guide de Déploiement](README_DEPLOYMENT.md) — Instructions détaillées
- [Plan d'Implémentation](IMPLEMENTATION_PLAN.md) — Décisions d'architecture
- [Rapport d'Ingénierie](ENGINEERING_REPORT.md) — Analyse technique complète
- [Intégration YouCam](YOUCAM_INTEGRATION.md) — Documentation API YouCam
- [Résumé Final](FINAL_SUMMARY.md) — État du projet

---

## 📄 License

Ce projet est sous licence **MIT** — voir [LICENSE](LICENSE) pour détails.

---

## 👥 Auteurs

**DERMATHERM Research Team**
- Développement : Plateforme de recherche computationnelle
- Contact : [GitHub Issues](https://github.com/AsamaeS/DERMATHERM/issues)

---

## 🙏 Remerciements

- **React + Vite** — Framework frontend moderne
- **Node.js + Express** — Backend robuste
- **better-sqlite3** — Base de données performante
- **Featherless AI** — Accès Qwen pour extraction de littérature
- **YouCam API** — Observation cutanée optionnelle
- **Docker** — Déploiement simplifié

---

## 📊 Statut du Projet

```
✅ Implémentation     ████████████████████ 100%
✅ Documentation      ████████████████████ 100%
✅ Tests              ███████████████░░░░░  75%
✅ Déploiement        ████████████████████ 100%
⚠️  Validation exp.   ████████░░░░░░░░░░░░  40%
```

**Version actuelle :** 1.0.0  
**Statut :** ✅ Production-Ready (avec limitations documentées)  
**Dernier commit :** [Voir GitHub](https://github.com/AsamaeS/DERMATHERM)

---

<div align="center">

**[⬆ Retour en haut](#-dermatherm)**

Construit avec ❤️ pour la recherche scientifique rigoureuse

</div>
