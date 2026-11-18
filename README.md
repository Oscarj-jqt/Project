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
Commencement de J2

## Organisation

- `frontend/` : future interface React/TypeScript
- `backend/` : future API FastAPI et ETL Python
- `data/` : sources brutes et métadonnées