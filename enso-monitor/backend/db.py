"""
Pool de connexions PostgreSQL avec psycopg 3.

Le pool est initialisé au démarrage de l'API et fermé à l'arrêt.
Chaque requête obtient une connexion réutilisable du pool.

"""

from contextlib import asynccontextmanager

from psycopg_pool import AsyncConnectionPool

from config import DatabaseConfig

_pool: AsyncConnectionPool | None = None


async def initialize_pool(config: DatabaseConfig) -> None:
    """Initialise le pool de connexions. À appeler au démarrage de l'API."""
    global _pool
    _pool = AsyncConnectionPool(config.connection_string)
    await _pool.open()


async def close_pool() -> None:
    """Ferme le pool de connexions. À appeler à l'arrêt de l'API."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


def get_pool() -> AsyncConnectionPool:
    if _pool is None:
        raise RuntimeError("Le pool de connexions n'est pas initialisé")
    return _pool


@asynccontextmanager
async def get_connection():

    pool = get_pool()
    async with pool.connection() as conn:
        yield conn
