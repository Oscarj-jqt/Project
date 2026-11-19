"""
Application FastAPI pour l'analyse ENSO/ONI.

- Démarrage : initialise le pool de connexions PostgreSQL.
- Arrêt : ferme le pool proprement.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI

from config import get_database_config
from db import initialize_pool, close_pool
from routers.api import router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gère l'initialisation et la fermeture du pool de connexions."""
    config = get_database_config()
    await initialize_pool(config)
    print(f"Pool de connexions initialisé : {config.host}:{config.port}/{config.database}")

    yield

    await close_pool()
    print("Pool de connexions fermé")


app = FastAPI(
    title="API ENSO Monitor",
    description="Analyse des données ENSO/ONI depuis la NOAA",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(router)


@app.get("/")
async def root():
    return {"message": "API ENSO Monitor v1"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

