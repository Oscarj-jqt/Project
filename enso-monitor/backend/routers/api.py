"""
Routeur pour toutes les routes de l'API ENSO Monitor (health, endpoints)
"""

from datetime import date
from fastapi import APIRouter, HTTPException, Query
from psycopg import OperationalError

from db import get_connection
from schemas import ONIObservationResponse

router = APIRouter()


@router.get("/health")
def health():
    try:
        with get_connection() as conn:
            conn.execute("SELECT 1")
        return {"status": "ok"}
    except OperationalError as e:
        raise HTTPException(
            status_code=503,
            detail=f"La connexion à la base de données a échoué: {str(e)}",
        )


@router.get("/api/v1/oni", response_model=list[ONIObservationResponse])
def list_oni_observations(
    debut: date | None = Query(None, description="Date de début (YYYY-MM-DD)"),
    fin: date | None = Query(None, description="Date de fin (YYYY-MM-DD)"),
):
    """
    Liste les observations ONI triées par date centrale.
    
    Paramètres optionnels :
    - debut : Date de début au format YYYY-MM-DD
    - fin : Date de fin au format YYYY-MM-DD
    """
    try:
        with get_connection() as conn:
            # Construire la requête dynamiquement selon les filtres
            query = """
                SELECT date_centrale, periode, valeur_oni
                FROM oni
                WHERE 1=1
            """
            params = []
            
            if debut:
                query += " AND date_centrale >= %s"
                params.append(debut)
            
            if fin:
                query += " AND date_centrale <= %s"
                params.append(fin)
            
            query += " ORDER BY date_centrale ASC"
            
            rows = conn.execute(query, params).fetchall()
        
        # Convertir les tuples en ONIObservationResponse
        observations = [
            ONIObservationResponse(
                date_centrale=row[0],
                periode=row[1],
                valeur_oni=row[2],
            )
            for row in rows
        ]
        return observations
    except OperationalError as e:
        raise HTTPException(
            status_code=503,
            detail=f"La requête à la base de données a échoué: {str(e)}",
        )

