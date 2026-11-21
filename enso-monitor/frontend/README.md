## État du projet frontend

J4 terminé : interface React/TypeScript, visualisation avec Recharts,
comparaison d'épisodes, disclaimers, et tests Vitest réalisés.


## Organisation

- `frontend/` : Application React + TypeScript + Vite
- `src/services/` : API client et utilitaires ENSO
- `src/components/` : Composants réutilisables (Filters, ONIChart, EpisodeComparison)
- `src/tests/` : Tests Vitest (16 tests, 3 fichiers)

## Installation et Configuration

### Prérequis

- Node.js 18+ et npm

### Frontend

1. Installer les dépendances :

   ```powershell
   cd frontend
   npm install
   ```

   **Note :** Installation inclut Vitest et toutes les dépendances de test (`@testing-library/react`, `jsdom`, etc.)

2. Configurer l'environnement : créer `.env.local` si API backend sur URL différente :

   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

   Par défaut, le proxy Vite redirige `/api` vers `http://localhost:8000`.

3. Vérifier l'environnement :

   ```powershell
   npm list react react-dom typescript vite vitest
   ```


## Architecture et choix de conception

### Stack choisie (respectant le plan)

- **React 19** + **TypeScript** : typage strict, composants réutilisables
- **Vite** : bundler rapide
- **Recharts** : graphique Niño 3.4 avec phases El Niño/La Niña colorées
- **Axios** : requêtes HTTP vers API backend
- **Vitest** : tests unitaires (rapides, intégrés Vite)
- **@testing-library/react** : tests composants et intégration

## Développement local

### Lancer le frontend en mode développement

Backend doit tourner sur `http://localhost:8000` :

```powershell
npm run dev
```

Accéder à `http://localhost:5173` dans le navigateur.


## Phases réalisées en J4

### Phase 1 : UI et visualisation

1. Créer composants Filters, ONIChart, EpisodeComparison
2. Intégrer Recharts avec observations réelles
3. Implémenter filtrage par date (Filters → App → API)
4. Ajouter pagination dans EpisodeComparison

### Phase 2 : Améliorations UX (jour)

5. Ajouter explications textuelles (sous graphique, après comparaison)
6. Ajouter disclaimers (scientifique + responsabilité)
7. Appliquer palette NOAA
8. Vérifier responsive mobile/desktop

### Phase 3 : Tests (jour)

9. Installer Vitest + dépendances
10. Écrire 16 tests (parcours utilisateur + utilitaires)
11. Vérifier build et TypeScript strict
12. Documenter (README.md + TESTS.md)

## Tests Vitest Fin J4

### Philosophie

**Sobre et complète, maîtrisée :**
- 1 test = 1 comportement (pas de super-tests)
- Pas de mock React complexe (focus métier)
- Données réalistes (NOAA authentiques)
- Code lisible et auto-explicatif


### Structure (3 fichiers, 16 tests)

#### **src/tests/App.test.tsx** (6 tests)

Vérifie qu'un changement de période actualise les données affichées.

- `filtre les observations par date de début`
- `filtre les observations par date de fin`
- `filtre les observations par plage de dates`
- `extrait les épisodes après filtrage de période`
- `actualise la courbe avec les bonnes données`
- `gère une plage vide correctement`

**Exemple :**
```typescript
// Utilisateur : filtre 2010-01-01 à 2015-12-31
// Résultat : 15 observations, 2 épisodes identifiés
```

#### **src/tests/episodeUtils.test.ts** (7 tests)

Vérifie extraction et classification d'épisodes ENSO.

- Extraction El Niño (seuil >= 0.5)
- Extraction La Niña (seuil <= -0.5)
- Filtrage phases Neutre
- Calcul durée en mois
- Comparaison d'épisodes
- Identification épisodes multiples
- Classification intensité (faible/modérée/forte)

**Exemple :**
```typescript
// El Niño 2015-11 à 2015-12 (valeurs 1.3, 1.7)
// La Niña 2016-03 à 2016-04 (valeurs -0.6, -0.8)
// Résultat : 2 épisodes identifiés, Neutre filtré
```

#### **src/tests/api.test.ts** (3 tests)

Vérifie service API client.

- Service API existe et est appelable
- Paramètres `debut`, `fin` acceptés
- Réponse est un tableau d'observations


### Exécuter les tests

```powershell
npm test
```

**📖 Lire** [`TESTS.md`](./TESTS.md) **pour exécution rapide et suites détaillées.**

### Couverture du plan

Le but est de vérifier qu'un changement de période actualise la courbe ou les valeurs affichées
