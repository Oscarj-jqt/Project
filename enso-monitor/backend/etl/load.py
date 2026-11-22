"""
Chargement des observations ONI dans PostgreSQL.

Documentation psycopg 3 : https://www.psycopg.org/psycopg3/docs/
"""

import psycopg

from config import get_database_config
from etl.oni import ONIObservation, read_oni_file

# Insertion ou remplacement : si la date centrale existe déjà ,
# la période et la valeur sont mises à jour. Le script peut donc être relancé
# sans créer de doublon et corrige une valeur révisée par la NOAA.
UPSERT_SQL = """
INSERT INTO oni (date_centrale, periode, valeur_oni)
VALUES (%s, %s, %s)
ON CONFLICT (date_centrale) DO UPDATE
SET periode = EXCLUDED.periode,
    valeur_oni = EXCLUDED.valeur_oni
"""


def get_database_url() -> str:
    """Utilise la même configuration PostgreSQL que l'API."""
    return get_database_config().connection_string


def load_observations(observations: list[ONIObservation], database_url: str) -> int:
    """
    Charge toutes les observations dans une seule transaction.

    Le bloc `with connect()` valide (COMMIT) à la sortie normale et annule
    (ROLLBACK) si une erreur survient : la table reste soit complète, soit inchangée.
    """
    rows = [(o.date_centrale, o.periode, o.valeur_oni) for o in observations]

    with psycopg.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.executemany(UPSERT_SQL, rows)

    return len(rows)


if __name__ == "__main__":
    loaded = load_observations(read_oni_file(), get_database_url())
    print(f"Observations chargées : {loaded}")
