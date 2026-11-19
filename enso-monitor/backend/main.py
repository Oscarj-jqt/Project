"""
Application FastAPI pour l'analyse des données ENSO/ONI

- Démarrage : initialise le pool de connexions PostgreSQL
- Arrêt : ferme le pool proprement
"""

from fastapi import FastAPI

from config import get_database_config
from db import initialize_pool, close_pool
from routers.api import router


def lifespan_startup():
    """Initialise le pool de connexions au démarrage"""
    config = get_database_config()
    initialize_pool(config)
    print(f"Pool de connexions initialisé : {config.host}:{config.port}/{config.database}")


def lifespan_shutdown():
    """Ferme le pool de connexions à l'arrêt"""
    close_pool()
    print("Pool de connexions fermé")


app = FastAPI(
    title="API ENSO Monitor",
    description="Analyse des données ENSO/ONI depuis la NOAA",
    version="1.0.0",
)

# Enregistrer les événements de démarrage/arrêt
app.add_event_handler("startup", lifespan_startup)
app.add_event_handler("shutdown", lifespan_shutdown)

app.include_router(router)


@app.get("/")
def root():
    return {"message": "API ENSO Monitor v1"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

