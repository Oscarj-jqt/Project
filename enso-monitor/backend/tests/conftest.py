"""
Configuration pytest globale.

Ce fichier est exécuté avant tous les tests et configure l'environnement.
"""

from pathlib import Path

from dotenv import load_dotenv

# Charger les variables d'environnement depuis .env
env_file = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_file)

