"""
Routeur pour toutes les routes de l'API ENSO Monitor (health , endpoints)
"""

from fastapi import APIRouter, HTTPException
from psycopg import OperationalError

from db import get_connection

router = APIRouter()


@router.get("/health")
async def health():
    try:
        async with get_connection() as conn:
            await conn.execute("SELECT 1")
        return {"status": "ok"}
    except OperationalError as e:
        raise HTTPException(
            status_code=503,
            detail=f"La connexion à la base de données a échoué: {str(e)}",
        )

