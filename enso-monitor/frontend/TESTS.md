# Tests Frontend - Quick Reference

## Exécution rapide

```bash
npm test              # Lancer tous les tests
npm run test:ui       # Lancer avec UI interactive
```

**Résultat :** 16/16 tests passent ✅

## Suites de tests

| Suite | Fichier | Tests | Objet |
|-------|---------|-------|-------|
| **Parcours utilisateur** | `App.test.tsx` | 6 | Filtrage par période, actualisation courbe |
| **Utilitaires ENSO** | `episodeUtils.test.ts` | 7 | Extraction El Niño/La Niña, intensité |
| **API client** | `api.test.ts` | 3 | Méthodes service API (getObservations) |

## Architecture

```
frontend/src/tests/
├── setup.ts                   # Configuration Vitest + jsdom
├── App.test.tsx               # 6 tests
├── episodeUtils.test.ts       # 7 tests
└── api.test.ts                # 3 tests
```

## Validation fonctionnelle

Après `npm run build`, vérifier dans le navigateur :

1. Charger `http://localhost:5173`
2. Changer dates début/fin dans Filters
3. Cliquer "Appliquer"
4. Graphique se met à jour
5. Épisodes affichés changent
6. Statistiques (obs, période, min/max) changent