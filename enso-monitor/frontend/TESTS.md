# Tests Frontend - ENSO Monitor

## Philosophie des tests

Comme le prescrit le plan du projet, les tests frontend suivent une approche **sobre et complète**, primant la cohérence et la maîtrise plutôt qu'un ensemble de fonctionnalités fragiles.

**Principes appliqués :**
- ✅ Tester UN comportement précis par test
- ✅ Vérifier la logique métier, pas l'UI superficiellement
- ✅ Pas de mock complexe : focus sur les données et filtres
- ✅ Chaque test doit pouvoir être expliqué simplement
- ✅ Comportements testés : filtrage par période, extraction d'épisodes, actualisation de données


## Structure des tests

### 1. **App.test.tsx** - Parcours utilisateur et changement de période (6 tests)

**Objectif :** Vérifier qu'un changement de période actualise les données affichées.

#### Tests inclus :

| Test | Vérification |
-|
| `filtre les observations par date de début` | Données >= date_début sont retenues |
| `filtre les observations par date de fin` | Données <= date_fin sont retenues |
| `filtre les observations par plage de dates` | Plage [début, fin] fonctionne correctement |
| `extrait les épisodes après filtrage de période` | Les épisodes identifiés correspondent aux données filtrées |
| `actualise la courbe avec les bonnes données` | Les données affichées changent quand la période change |
| `gère une plage vide correctement` | Pas de crash si aucune donnée pour la plage |

**Exemple de scénario testé :**
```
1. Utilisateur filtre : début=2010-01-01, fin=2015-12-31
2. Frontend reçoit de l'API : 15 observations de cette plage
3. EpisodeComparison extrait 2 épisodes El Niño/La Niña
4. Graphique affiche 15 points avec les bons seuils
```


### 2. **episodeUtils.test.ts** - Extraction et comparaison d'épisodes (7 tests)

**Objectif :** Vérifier que les épisodes ENSO sont identifiés correctement.

#### Tests inclus :

| Test | Vérification |
-|
| `extrait un épisode El Niño quand valeur_oni >= 0.5` | Seuil El Niño respecté |
| `extrait un épisode La Niña quand valeur_oni <= -0.5` | Seuil La Niña respecté |
| `ignore les phases Neutre (seuil -0.5 à 0.5)` | Phases entre -0.5 et 0.5 sont exclues |
| `calcule la durée en mois d'un épisode` | Durée > 0 et nombre valide |
| `compare deux épisodes El Niño` | Comparaison retourne champs cohérents |
| `identifie plusieurs épisodes consécutifs` | 2+ épisodes = 2+ types (El Niño + La Niña) |
| `calcule l'intensité correctement` | Intensité `faible/modérée/forte` selon seuils |

**Exemple de test :**
```typescript
// Données : El Niño de nov-2015 à déc-2015
// Neutre : janv-2016
// La Niña : mars-2016 à avril-2016

const episodes = extractEpisodes(data);
// Résultat : 2 épisodes (El Niño + La Niña)
// Neutre est filtré automatiquement
```


### 3. **api.test.ts** - Service API client (3 tests)

**Objectif :** Vérifier que le service API expose les bonnes méthodes.

#### Tests inclus :

| Test | Vérification |
-|
| `récupère les observations sans filtre` | `oniAPI.getObservations()` existe |
| `envoie la date de début au filtre` | Méthode accepte `debut` |
| `envoie la date de fin au filtre` | Méthode accepte `fin` |


## Exécution des tests

### Lancer tous les tests

```bash
npm test
```

**Résultat attendu :**
```
 Test Files  3 passed (3)
      Tests  16 passed (16)
```


## Couverture de test

| Fichier | Contenu | Tests |
-|
| **src/tests/App.test.tsx** | Parcours utilisateur, filtrage de période | 6 |
| **src/tests/episodeUtils.test.ts** | Extraction et classification d'épisodes | 7 |
| **src/tests/api.test.ts** | API client (méthodes disponibles) | 3 |
| **Total** | | **16 tests** |



## Architecture des tests

```
frontend/
├── src/
│   ├── tests/
│   │   ├── setup.ts                 # Configuration Vitest
│   │   ├── App.test.tsx             # 6 tests parcours
│   │   ├── episodeUtils.test.ts     # 7 tests utilitaires
│   │   └── api.test.ts              # 3 tests API
│   ├── services/
│   │   ├── api.ts                   # Service API (oniAPI)
│   │   └── episodeUtils.ts          # Utilitaires (extractEpisodes, compareEpisodes)
│   └── ...
├── vitest.config.ts                 # Configuration Vitest
└── package.json                      # Scripts npm test
```


## Notes techniques

### Choix de conception

1. **Pas de mock React complexe**
   - Raison : Les tests métier (filtrage, extraction) ne nécessitent pas de React
   - Approche : Tester les utilitaires directement avec des données réelles

2. **Tests d'intégration simples**
   - Raison : Vérifier le flux complet (données → filtrage → épisodes)
   - Pas d'UI rendering : focus sur la logique

3. **Données de test réalistes**
   - Raison : Reflètent les vraies données NOAA
   - Exemple : `valeur_oni: 1.3` pour El Niño fort

### Outils utilisés

- **Vitest** : Framework de test rapide et moderne
- **@testing-library/react** : Pour les tests React (si nécessaire)
- **jsdom** : Environnement DOM pour les tests
- **describe/it/expect** : Syntaxe BDD standard


## Validation fonctionnelle

Pour valider que les tests reflètent le comportement réel :

1. **Lancer le backend**
   ```bash
   cd backend
   python main.py
   ```

2. **Lancer le frontend en dev**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Exécuter les tests**
   ```bash
   npm test
   ```

4. **Vérifier manuellement dans le navigateur :**
   - Charger http://localhost:5173
   - Changer les dates de début/fin
   - Cliquer "Appliquer"
   - Vérifier que le graphique se met à jour
   - Vérifier que les épisodes affichés changent