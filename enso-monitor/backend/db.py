"""
Pool de connexions PostgreSQL synchrone avec psycopg 3.

Utilise ConnectionPool classique (non-async) pour compatibilité maximale.
"""

from contextlib import contextmanager

from psycopg_pool import ConnectionPool

from config import DatabaseConfig

_pool: ConnectionPool | None = None


def initialize_pool(config: DatabaseConfig) -> None:
    """Initialise le pool de connexions. À appeler au démarrage de l'API."""
    global _pool
    _pool = ConnectionPool(config.connection_string, min_size=1, max_size=10)
    _pool.open()
    
    # Initialiser les données si nécessaire
    from db_init import init_data
    init_data(config.connection_string)


def close_pool() -> None:
    """Ferme le pool de connexions. À appeler à l'arrêt de l'API."""
    global _pool
    if _pool:
        _pool.close()
        _pool = None


def get_pool() -> ConnectionPool:
    if _pool is None:
        raise RuntimeError("Le pool de connexions n'est pas initialisé")
    return _pool


@contextmanager
def get_connection():
    """Contexte synchrone pour obtenir une connexion du pool."""
    pool = get_pool()
    with pool.connection() as conn:
        yield conn
