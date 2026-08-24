# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère à [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2026-08-24

### 🎉 Version Initiale - Production Ready

#### ✨ Ajouté

**Frontend**
- Simulation 2D FTCS couplée (chaleur + humidité)
  - Grille 56×140 avec pas de temps CFL-limité
  - Évaporation interfaciale avec Buck saturation
  - Audit de conservation < 1% erreur
  - Visualisation temps réel (Canvas 2D)
- Benchmark PINN avec différentiation automatique exacte
  - Architecture MLP (2×20 neurones, tanh)
  - Optimiseur Adam avec loss physique
  - Comparaison analytique/PINN/FD
- Interface utilisateur complète
  - Registre de matériaux avec filtres
  - Gestion d'expériences
  - Observation cutanée (YouCam, optionnel)
  - Documentation intégrée
- Dossier scientifique (26 sections)
- Traçabilité complète des paramètres

**Backend**
- API REST Node.js + Express
  - 15+ endpoints documentés
  - Validation Zod stricte
  - Health checks
  - CORS configuré
- Base de données SQLite
  - 4 tables avec relations
  - Schéma auto-initialisé
  - Migrations gérées
- Services IA
  - Qwen (Featherless) pour extraction littérature
  - Firecrawl pour recherche articles
  - YouCam API pour observation cutanée
- Système de provenance
  - Statut : SUPPORTED / ASSUMED / NOT VERIFIED
  - Niveau de confiance : MEASURED / REPORTED / DERIVED
  - Source et conditions expérimentales

**Déploiement**
- Docker multi-stage builds
- docker-compose orchestration
- Configuration Nginx
- Scripts démarrage Windows/Linux
- Health checks automatiques
- Volumes persistants

**Documentation**
- README.md professionnel avec badges et schémas
- ARCHITECTURE.md avec diagrammes ASCII complets
- IMPLEMENTATION_PLAN.md
- ENGINEERING_REPORT.md
- README_DEPLOYMENT.md
- YOUCAM_INTEGRATION.md
- CONTRIBUTING.md
- Templates GitHub Issues
- Changelog

#### 🔬 Scientifique

- 13 limitations documentées (L-01 à L-13)
- 15 règles de provenance appliquées
- Équations de transport couplées implémentées
- Validation PINN vs analytique
- Disclaimers médical obligatoires
- Séparation stricte : observation ≠ simulation ≠ diagnostic

#### 🔒 Sécurité

- Variables d'environnement (.env.example)
- Validation des entrées (Zod)
- CORS configuré
- Limites de requête (50MB)
- Utilisateur non-root Docker
- Pas de secrets hardcodés

#### 📊 Performance

- Build frontend : ~15s
- Backend start : ~2s
- Simulation 1000 steps : ~5s
- PINN training 1000 epochs : ~30s
- API response : <100ms

### 🐛 Corrigé

- Compilation error dans App.tsx (SkinObservationPage)
- better-sqlite3 sur Windows (documenté, solution Docker)

### ⚠️ Limitations Connues

Voir [README.md#limitations](README.md#limitations) pour la liste complète.

**Principales** :
- Paramètres basés sur plages littérature (pas de textile spécifique)
- Modèle couplé non validé expérimentalement
- Benchmark PINN = équation chaleur simplifiée uniquement
- Géométrie 2D rectangulaire (pas de vêtement 3D)
- Propriétés matérielles constantes (pas de dépendance T/W)

### 📝 Notes

Cette version est **production-ready** mais reste un **prototype de recherche**.

- ✅ Déployable sur Vercel/Render/Railway/Docker
- ✅ Documentation complète
- ✅ Intégrité scientifique préservée
- ⚠️  Validation expérimentale à venir
- ⚠️  Tests automatisés à compléter

---

## [Non publié]

### 🚀 Roadmap v2.0

**Validation Scientifique**
- PINN 2D couplé (température + humidité)
- Validation expérimentale avec données réelles
- Convergence de grille
- Vérification Wolfram/COMSOL

**Features Avancées**
- Géométrie 3D avec maillage adaptatif
- Propriétés dépendantes (T, W)
- Rayonnement thermique
- Convection forcée locale
- Multi-couches textiles

**Infrastructure**
- Migration PostgreSQL (multi-user)
- Authentication JWT
- Rate limiting
- WebSocket temps réel
- Export PDF

**Tests & CI/CD**
- Coverage >80%
- Tests d'intégration
- GitHub Actions
- Benchmarks automatisés

**UX/UI**
- Design system Stitch complet
- Mode sombre
- Internationalisation (i18n)
- Accessibilité WCAG AA

---

## Format

Types de changements :
- `✨ Ajouté` : Nouvelles fonctionnalités
- `🔄 Modifié` : Changements aux fonctionnalités existantes
- `🗑️ Déprécié` : Fonctionnalités bientôt retirées
- `🐛 Corrigé` : Corrections de bugs
- `🔒 Sécurité` : Corrections de vulnérabilités
- `🔬 Scientifique` : Validation, équations, données

---

[1.0.0]: https://github.com/AsamaeS/DERMATHERM/releases/tag/v1.0.0
