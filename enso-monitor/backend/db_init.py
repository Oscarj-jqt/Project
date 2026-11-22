"""
Script d'initialisation des données ONI au démarrage du backend.
Exécuté une seule fois quand le pool se connecte pour la première fois.
"""

import os
from pathlib import Path

import psycopg

from etl.oni import read_oni_file


def init_data(database_url: str) -> None:
    """Initialise les données ONI si la table est vide."""
    
    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            # Vérifier si la table a des données
            cur.execute("SELECT COUNT(*) FROM oni")
            count = cur.fetchone()[0]
            
            if count > 0:
                print(f"✓ Table oni initialisée ({count} observations)")
                return
            
            print("Initialisation des données ONI...")
            
            # Charger les observations depuis le fichier HTML
            try:
                observations = read_oni_file()
            except FileNotFoundError:
                # Si le fichier n'existe pas, c'est normal en Docker
                # Les données existent déjà dans la DB (persitence)
                return
            
            # Insérer les observations
            UPSERT_SQL = """
            INSERT INTO oni (date_centrale, periode, valeur_oni)
            VALUES (%s, %s, %s)
            ON CONFLICT (date_centrale) DO UPDATE
            SET periode = EXCLUDED.periode,
                valeur_oni = EXCLUDED.valeur_oni
            """
            
            rows = [(o.date_centrale, o.periode, o.valeur_oni) for o in observations]
            
            with conn.cursor() as cur:
                cur.executemany(UPSERT_SQL, rows)
            
            conn.commit()
            print(f"✓ {len(rows)} observations ONI chargées")

