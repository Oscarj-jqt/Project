# ENSO Monitor

Application d'analyse historique de l'indice ONI fourni par la NOAA.

## Périmètre du MVP

- importer une série ONI 
- stocker les données dans PostgreSQL 
- exposer les observations avec FastAPI 
- visualiser les valeurs dans une courbe avec React 
- comparer deux épisodes ONI.

## État du projet

J1 terminé : cadrage scientifique, choix de l'ONI,
user stories et maquette réalisés.
J2 : schéma PostgreSQL, ETL, import et tests réalisés.

## Organisation

- `frontend/` : future interface React/TypeScript
- `backend/` : future API FastAPI et ETL Python
- `data/` : sources brutes et métadonnées

## PostgreSQL en local

Docker Desktop doit être démarré. Depuis PowerShell, dans le dossier
`enso-monitor/` :

1. Créer un dans backend/ `.env` et remplacer le mot de passe par une valeur locale. Le fichier `.env` ne doit pas être ajouté à Git.


2. Démarrer PostgreSQL et vérifier qu'il accepte les connexions :

3. Appliquer une seule fois la première migration :

   ```powershell
   Get-Content -Raw .\backend\migrations\001_creation_oni.sql | docker compose exec -T db psql -v ON_ERROR_STOP=1 -U enso_app -d enso_monitor
   ```

4. Vérifier la table et ses contraintes :

   ```powershell
   docker compose exec db psql -U enso_app -d enso_monitor -c "\d oni"
   ```

La base est accessible uniquement sur `127.0.0.1:5432` depuis la machine.

## Import des données ONI (ETL)

**Provenance** : copie HTML de la page NOAA CPC 
conservée sans modification dans `data/`. Détails (URL, date d'extraction) :
[data/README.md](enso-monitor/data/README.md).

**Bibliothèques** (Python 3.12) :

- `psycopg` 3 : connexion à PostgreSQL (`pip install "psycopg[binary]"`) ;
- `pytest` : tests automatisés (`pip install pytest`) ;


**Fonctionnement** (dans `backend/etl/`) :

1. `oni.py` extrait le tableau HTML et transforme chaque valeur en observation
2. `load.py` charge les observations dans la table `oni` en une transaction.
   Une date déjà présente est mise à jour 
   l'import peut être relancé sans créer de doublon.

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
