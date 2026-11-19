## État du projet backend

J1 terminé : cadrage scientifique, choix de l'ONI,
user stories et maquette réalisés.

J2 terminé : schéma PostgreSQL, ETL, import et tests réalisés.
921 observations importées (1950-01 à 2026-09).

J3 terminé : API FastAPI avec 2 endpoints, filtres de dates, 10 tests validés.

## Organisation

- `frontend/` : future interface React/TypeScript
- `backend/` : API FastAPI et ETL Python
- `data/` : sources brutes et métadonnées

## Installation et Configuration

### Prérequis

- Python 3.12+
- Docker

### Backend

1. Créer un environnement virtuel et installer les dépendances :

   ```powershell
   cd backend
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. Configurer l'environnement : copier `.env.example` en `.env` et adapter les variables (notamment `POSTGRES_PASSWORD`) :

   ```powershell
   # Sur PowerShell
   Copy-Item .env.example .env
   # Puis éditer .env avec tes identifiants
   ```

3. Vérifier l'environnement :

   ```powershell
   # Le prompt doit afficher "(venv)" au début
   # Vérifier que les dépendances sont bien chargées
   pip list
   ```

## PostgreSQL en local

Docker Desktop doit être démarré. Depuis PowerShell, dans le dossier
`enso-monitor/` :

1. Créer un `.env` dans `backend/` avec le mot de passe PostgreSQL et les autres variables. Le fichier `.env` ne doit pas être ajouté à Git.

2. Démarrer PostgreSQL et vérifier qu'il accepte les connexions :

   ```powershell
   docker-compose up -d
   ```

3. Appliquer une seule fois la première migration :

   ```powershell
   Get-Content -Raw .\backend\migrations\001_creation_oni.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U enso_app -d enso_monitor
   ```

4. Vérifier la table et ses contraintes :

   ```powershell
   docker compose exec db psql -U enso_app -d enso_monitor -c "\d oni"
   ```

La base est accessible uniquement sur `127.0.0.1:5432` depuis la machine.

## Import des données ONI (ETL) — J2

**Provenance** : copie HTML de la page NOAA CPC 
conservée sans modification dans `data/`. Détails (URL, date d'extraction) :
[data/README.md](enso-monitor/data/README.md).

**Bibliothèques** (Python 3.12) :

- `psycopg` 3 : connexion à PostgreSQL (`pip install "psycopg[binary]"`) ;
- `pytest` : tests automatisés (`pip install pytest`) ;


**Fonctionnement** (dans `backend/etl/`) :

1. `oni.py` extrait le tableau HTML et transforme chaque valeur en observation
2. `load.py` charge les observations dans la table `oni` en une transaction.
   Une date déjà présente est mise à jour. L'import peut être relancé sans créer de doublon.

**Lancer l'import** (PostgreSQL démarré et migration appliquée), depuis `backend/` :

```powershell
$env:POSTGRES_PASSWORD = "<mot de passe du .env>"
python -m etl.load
```

Résultat attendu : `Observations chargées : 921` (1950-01 à 2026-09, source du 18/11/2026).

**Tester** :

```powershell
python -m pytest tests/test_oni_etl.py -v
```

Les tests couvrent la transformation d'une ligne, les cellules vides, une valeur invalide et la comparaison avec des valeurs de la page NOAA.

## API FastAPI — J3

**Endpoints** :

- `GET /health` : vérification de la connexion à PostgreSQL
  - Réponse 200 : `{"status": "ok"}`
  - Réponse 503 : base inaccessible

- `GET /api/v1/oni` : liste des 921 observations, optionnellement filtrées
  - Paramètres (optionnels) :
    - `debut=YYYY-MM-DD` : observations >= cette date
    - `fin=YYYY-MM-DD` : observations <= cette date
  - Réponse 200 : `[{date_centrale, periode, valeur_oni}, ...]` trié par date croissante
  - Réponse 422 : date invalide ou `debut > fin`
  - Réponse 503 : base inaccessible

**Tester** :

```powershell
python -m pytest tests/test_oni_api.py -v
```

10 tests couvrent : liste complète, tri, champs requis, filtres valides, validations (date invalide, `debut > fin`), intervalle vide.
