# ENSO Monitor - Docker Compose Guide

## Prérequis

- Docker 20.10+
- Docker Compose 2.0+
- `.env` file (copié depuis `.env.example`)

## Setup rapide

### 1. Créer `.env` à partir du template

```powershell
cp .env.example .env
```

Éditer `.env` et définir `POSTGRES_PASSWORD` :

```
POSTGRES_PASSWORD=votre_mot_de_passe_securise
```

### 2. Lancer les services

```powershell
docker-compose up -d
```

**Résultat :**
```
 Frontend (React)   → http://localhost:5173
 Backend (FastAPI)  → http://localhost:8000
 Database (PostgreSQL) → localhost:5432 (interne)
```

### 3. Vérifier l'état

```powershell
docker-compose ps
```

### 4. Arrêter les services

```powershell
docker-compose down
```

## Architecture

### Services

| Service | Port | Rôle | Réseau |
|---------|------|------|--------|
| **frontend** | 5173 | Interface React/Vite | front-tier + back-tier |
| **backend** | 8000 | API FastAPI | back-tier |
| **db** | 5432 | PostgreSQL | back-tier |

### Réseaux

- **front-tier** : Communication frontend ↔ monde externe
- **back-tier** : Communication backend ↔ database (interne)

### Volumes

- **postgres_data** : Données PostgreSQL persistantes

## Développement vs Production

### Mode développement (sans Docker)

```powershell
# Terminal 1 : Backend
cd backend
python main.py

# Terminal 2 : Frontend
cd frontend
npm run dev
```

### Mode production (avec Docker)

```powershell
docker-compose up -d
```

## Dépendances et Health Checks

```
frontend
  ├─ depends_on: backend
  └─ healthcheck: HTTP GET /

backend
  ├─ depends_on: db (healthy)
  └─ healthcheck: HTTP GET /health

db
  └─ healthcheck: PostgreSQL ready
```

Les services attendent que leurs dépendances soient "healthy" avant de démarrer.

## Logs

```powershell
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Nettoyage

```powershell
# Arrêter et supprimer conteneurs
docker-compose down

# Supprimer aussi les volumes (données)
docker-compose down -v
```

## Troubleshooting

### Frontend ne peut pas contacter backend

**Vérifier :**
```powershell
docker-compose ps                    # Tous en "healthy" ?
docker-compose logs backend          # Erreurs ?
curl http://localhost:8000/health    # API répond ?
```

### Database connection refused

**Solution :**
```powershell
docker-compose down -v               # Nettoyer volumes
docker-compose up -d db              # Relancer DB
docker-compose up -d                 # Relancer tout
```

### Rebuild après changement code

```powershell
# Backend
docker-compose up -d --build backend

# Frontend
docker-compose up -d --build frontend

# Tous
docker-compose up -d --build
```

## Production (optionnel)

Pour production, ajouter :
- Nginx reverse proxy
- SSL/TLS (Let's Encrypt)
- Environment variables sécurisées (.env.prod)
- Logs centralisés
- Monitoring (Prometheus, Grafana)
