# 🤝 Guide de Contribution — DERMATHERM

Merci de votre intérêt pour contribuer à **DERMATHERM** ! Ce document explique comment participer au développement de la plateforme.

---

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Standards de Développement](#standards-de-développement)
- [Processus de Pull Request](#processus-de-pull-request)
- [Tests](#tests)
- [Documentation](#documentation)
- [Questions et Support](#questions-et-support)

---

## 📜 Code de Conduite

### Principes Fondamentaux

**DERMATHERM** est un projet de recherche scientifique. Toutes les contributions doivent respecter :

1. **Intégrité Scientifique**
   - Aucune donnée falsifiée
   - Documentation complète des limitations
   - Citations appropriées des sources
   - Transparence sur les hypothèses

2. **Responsabilité**
   - Pas de prétentions médicales
   - Respect des périmètres définis
   - Validation avant affirmation

3. **Respect**
   - Communication professionnelle
   - Feedback constructif
   - Inclusion et bienveillance

### Comportements Inacceptables

❌ Harcèlement ou discrimination  
❌ Soumission de fausses données scientifiques  
❌ Ajout de prétentions médicales non validées  
❌ Suppression de disclaimers de sécurité  
❌ Code malveillant ou vulnérabilités intentionnelles

---

## 💡 Comment Contribuer

### Types de Contributions Recherchées

#### 🔬 Scientifique
- Validation expérimentale des modèles
- Amélioration des équations de transport
- Intégration de nouvelles données de littérature
- Benchmark avec solutions analytiques
- Comparaison avec logiciels externes (Wolfram, COMSOL)

#### 💻 Technique
- Correction de bugs
- Optimisation de performance
- Amélioration de l'architecture
- Ajout de tests unitaires/intégration
- Documentation du code

#### 🎨 UX/UI
- Amélioration de l'interface utilisateur
- Accessibilité (WCAG)
- Visualisations scientifiques
- Design responsive

#### 📚 Documentation
- Tutoriels et guides
- Traductions
- Amélioration du README
- Exemples d'utilisation

---

## 🛠️ Standards de Développement

### Setup Initial

```bash
# 1. Fork le repository sur GitHub

# 2. Cloner votre fork
git clone https://github.com/VOTRE-USERNAME/DERMATHERM.git
cd DERMATHERM

# 3. Ajouter le remote upstream
git remote add upstream https://github.com/AsamaeS/DERMATHERM.git

# 4. Installer les dépendances
npm install
cd backend && npm install && cd ..

# 5. Créer une branche pour votre feature
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### Conventions de Code

#### TypeScript/JavaScript

```typescript
// ✅ BON : Types explicites, noms descriptifs
interface MaterialParameter {
  value: number;
  unit: string;
  status: EvidenceStatus;
  source: string;
  confidence: ConfidenceLevel;
}

function calculateThermalDiffusivity(
  conductivity: number,
  density: number,
  specificHeat: number
): number {
  return conductivity / (density * specificHeat);
}

// ❌ MAUVAIS : Types any, noms courts
function calc(k: any, p: any, c: any): any {
  return k / (p * c);
}
```

#### Commentaires

```typescript
// ✅ BON : Explique le "pourquoi", pas le "quoi"
// CFL criterion ensures numerical stability for explicit FTCS scheme
// See Courant et al. (1928) for derivation
const dt = (dx * dx) / (4 * alpha);

// ❌ MAUVAIS : Répète le code
// Set dt to dx squared divided by 4 times alpha
const dt = (dx * dx) / (4 * alpha);
```

#### Traçabilité Scientifique

```typescript
// ✅ REQUIS pour tout paramètre physique
const material: Material = {
  name: "Cotton plain weave",
  parameters: {
    thermal_conductivity: {
      value: 0.045,
      unit: "W/m·K",
      status: "LITERATURE-SUPPORTED",
      source: "Textile Research Journal, Vol 89, 2023, p.142-158",
      confidence: "REPORTED",
      experimental_conditions: "20°C, 65% RH, still air",
      notes: "Average of 5 specimens, standard deviation ±0.003"
    }
  }
};

// ❌ INTERDIT : Valeurs sans provenance
const k = 0.045; // from somewhere
```

### Style de Code

- **Indentation** : 2 espaces (pas de tabs)
- **Guillemets** : Doubles `"` pour strings
- **Point-virgules** : Oui, toujours
- **Longueur de ligne** : Max 100 caractères
- **Nommage** :
  - Variables/fonctions : `camelCase`
  - Types/Interfaces : `PascalCase`
  - Constantes : `UPPER_SNAKE_CASE`
  - Fichiers : `kebab-case.ts`

### Architecture

```
🔧 Respect de la Séparation des Préoccupations

Frontend (React)
├─ components/     → UI uniquement, pas de logique métier
├─ lib/            → Logique (solveur, PINN, API client)
└─ data/           → Constantes et configuration

Backend (Node.js)
├─ routes/         → Endpoints HTTP uniquement
├─ services/       → Logique métier et intégrations externes
└─ db.ts           → Accès données uniquement

❌ Éviter :
- Logique métier dans les composants React
- Accès DB direct depuis les routes
- Mélange UI et calculs physiques
```

---

## 🔄 Processus de Pull Request

### Avant de Soumettre

- [ ] ✅ Le code compile sans erreur
- [ ] ✅ Les tests passent (`npm test`)
- [ ] ✅ La documentation est à jour
- [ ] ✅ Les commits sont atomiques et bien nommés
- [ ] ✅ Le code respecte les conventions
- [ ] ✅ Aucune régression fonctionnelle
- [ ] ✅ Les limitations sont documentées

### Template de Pull Request

```markdown
## Description

Résumé clair de ce qui change et pourquoi.

## Type de Changement

- [ ] 🐛 Bug fix (non-breaking, corrige un problème)
- [ ] ✨ Feature (non-breaking, ajoute une fonctionnalité)
- [ ] 💥 Breaking change (change l'API ou le comportement)
- [ ] 📚 Documentation uniquement
- [ ] 🔬 Scientifique (équations, validation, données)

## Checklist

- [ ] Tests unitaires ajoutés/mis à jour
- [ ] Documentation mise à jour
- [ ] Limitations documentées (si applicable)
- [ ] Provenance des paramètres (si données scientifiques)
- [ ] Aucune prétention médicale ajoutée

## Tests Effectués

Décrire comment vous avez testé vos changements.

## Captures d'Écran (si UI)

[Ajouter des captures si changement visuel]

## Notes Supplémentaires

Toute information utile pour les reviewers.
```

### Processus de Review

1. **Soumission** : Ouvrir la PR sur GitHub
2. **Review automatique** : CI/CD vérifie build et tests
3. **Review humaine** : Au moins 1 approbation requise
4. **Corrections** : Appliquer les retours si nécessaire
5. **Merge** : Squash and merge par un mainteneur

### Convention de Commits

Utiliser [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Format
<type>(<scope>): <description>

[corps optionnel]

[footer optionnel]

# Types
feat:     ✨ Nouvelle fonctionnalité
fix:      🐛 Correction de bug
docs:     📚 Documentation uniquement
style:    💅 Formatage (pas de changement de code)
refactor: ♻️  Refactoring (ni feature ni fix)
perf:     ⚡ Amélioration de performance
test:     ✅ Ajout/correction de tests
chore:    🔧 Maintenance (build, CI, etc.)
science:  🔬 Validation scientifique, équations

# Exemples
feat(solver): add adaptive timestep with CFL criterion
fix(api): correct material validation schema
docs(readme): add deployment guide for Railway
science(pinn): implement coupled 2D heat-moisture model
```

---

## 🧪 Tests

### Exécution des Tests

```bash
# Frontend
npm test

# Backend
cd backend && npm test

# Tous les tests
npm run test:all
```

### Structure des Tests

```typescript
// tests/solver.test.ts
import { describe, it, expect } from "vitest";
import { ftcsSolver } from "../src/lib/solver";

describe("FTCS Solver", () => {
  describe("Conservation", () => {
    it("should maintain mass balance within 1% error", () => {
      const result = ftcsSolver({
        grid: { nx: 56, ny: 140 },
        timesteps: 1000,
        // ...
      });
      
      expect(result.conservationError).toBeLessThan(0.01);
    });
  });

  describe("Stability", () => {
    it("should respect CFL criterion", () => {
      const alpha = 0.000001; // m²/s
      const dx = 0.00002; // m
      const dt = ftcsSolver.calculateTimestep(alpha, dx);
      
      const cfl = (alpha * dt) / (dx * dx);
      expect(cfl).toBeLessThanOrEqual(0.25);
    });
  });
});
```

### Coverage

Objectif : **>80% de couverture** pour nouveau code.

```bash
npm run test:coverage
```

---

## 📖 Documentation

### Documenter une Fonction

```typescript
/**
 * Calculate evaporation rate at textile-skin interface.
 * 
 * Uses Buck equation for saturation vapor pressure.
 * Assumes local thermodynamic equilibrium.
 * 
 * @param temperature - Interface temperature (°C)
 * @param moistureContent - Water content (kg/kg)
 * @param ambientRH - Ambient relative humidity (0-1)
 * @returns Evaporation rate (kg/m²·s)
 * 
 * @remarks
 * LIMITATION: Does not account for:
 * - Wind speed variations
 * - Radiation effects
 * - Fabric surface structure
 * 
 * @references
 * Buck, A. L. (1981). J. Appl. Meteorol., 20, 1527-1532.
 * 
 * @example
 * ```typescript
 * const E = calculateEvaporation(34, 0.05, 0.75);
 * console.log(`Evaporation: ${E} kg/m²·s`);
 * ```
 */
function calculateEvaporation(
  temperature: number,
  moistureContent: number,
  ambientRH: number
): number {
  // Implementation
}
```

### Documenter une API Endpoint

```typescript
/**
 * POST /api/materials
 * 
 * Create a new material with evidence provenance.
 * 
 * Request Body:
 * ```json
 * {
 *   "name": "Cotton plain weave",
 *   "category": "Natural textile",
 *   "parameters": {
 *     "thermal_conductivity": {
 *       "value": 0.045,
 *       "unit": "W/m·K",
 *       "status": "LITERATURE-SUPPORTED",
 *       "source": "Citation...",
 *       "confidence": "REPORTED"
 *     }
 *   }
 * }
 * ```
 * 
 * Response: 201 Created
 * ```json
 * {
 *   "id": "MAT-001",
 *   "created_at": "2024-01-15T10:30:00Z"
 * }
 * ```
 * 
 * Errors:
 * - 400: Invalid request body (Zod validation)
 * - 409: Material with same name already exists
 * - 500: Database error
 */
router.post("/materials", async (req, res) => {
  // Implementation
});
```

---

## ❓ Questions et Support

### Obtenir de l'Aide

1. **Documentation** : Consulter [README.md](README.md) et [ARCHITECTURE.md](ARCHITECTURE.md)
2. **Issues existantes** : Chercher dans [GitHub Issues](https://github.com/AsamaeS/DERMATHERM/issues)
3. **Nouvelle question** : Ouvrir une issue avec le label `question`

### Signaler un Bug

Utiliser le template d'issue :

```markdown
**Décrire le bug**
Description claire et concise.

**Reproduction**
Étapes pour reproduire :
1. Aller à '...'
2. Cliquer sur '...'
3. Observer '...'

**Comportement attendu**
Ce qui devrait se passer.

**Captures d'écran**
Si applicable.

**Environnement**
- OS: [e.g. Windows 11]
- Node.js: [e.g. 20.10.0]
- Navigateur: [e.g. Chrome 120]

**Contexte additionnel**
Toute information utile.
```

### Proposer une Feature

```markdown
**La feature est-elle liée à un problème ?**
Description du problème.

**Solution proposée**
Comment résoudre le problème.

**Alternatives considérées**
Autres approches envisagées.

**Impact scientifique**
Comment cela améliore la rigueur scientifique ?

**Limitations introduites**
Nouvelles limitations à documenter ?
```

---

## 🏆 Reconnaissance

Les contributeurs significatifs seront ajoutés dans :
- Section "Contributors" du README
- Fichier AUTHORS
- Release notes

---

## 📄 Licence

En contribuant à DERMATHERM, vous acceptez que vos contributions soient sous licence **MIT**.

---

<div align="center">

**Merci de contribuer à la recherche scientifique rigoureuse ! 🔬**

[⬆ Retour en haut](#-guide-de-contribution--dermatherm)

</div>
