"""
Tests API endpoints ONI.

"""

import pytest
from fastapi.testclient import TestClient

from main import app
from db import initialize_pool, close_pool
from config import get_database_config


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    """Initialise le pool de connexions avant tous les tests."""
    config = get_database_config()
    initialize_pool(config)
    yield
    close_pool()


@pytest.fixture
def client():
    return TestClient(app)


def test_get_oni_observations_returns_list(client):
    """Vérifie que GET /api/v1/oni retourne une liste d'observations"""
    response = client.get("/api/v1/oni")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    assert len(response.json()) > 0


def test_get_oni_observations_sorted_by_date(client):
    """Vérifie que les observations sont triées par date_centrale"""
    response = client.get("/api/v1/oni")
    assert response.status_code == 200
    observations = response.json()
    
    dates = [obs["date_centrale"] for obs in observations]
    assert dates == sorted(dates), "Les observations ne sont pas triées par date"


def test_get_oni_observations_have_required_fields(client):
    """Vérifie que chaque observation a les champs requis."""
    response = client.get("/api/v1/oni")
    assert response.status_code == 200
    observations = response.json()
    
    required_fields = {"date_centrale", "periode", "valeur_oni"}
    for obs in observations:
        assert required_fields.issubset(obs.keys()), f"Champs manquants dans: {obs}"


def test_health_check(client):
    """Vérifie que GET /health retourne un statut OK"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_filter_by_start_date(client):
    """Vérifie le filtrage par date de début"""
    response = client.get("/api/v1/oni?debut=2000-01-01")
    assert response.status_code == 200
    observations = response.json()
    
    # Toutes les dates doivent être >= 2000-01-01
    for obs in observations:
        assert obs["date_centrale"] >= "2000-01-01"


def test_filter_by_end_date(client):
    """Vérifie le filtrage par date de fin"""
    response = client.get("/api/v1/oni?fin=2010-12-31")
    assert response.status_code == 200
    observations = response.json()
    
    # Toutes les dates doivent être <= 2010-12-31
    for obs in observations:
        assert obs["date_centrale"] <= "2010-12-31"


def test_filter_by_date_range(client):
    """Vérifie le filtrage par plage de dates"""
    response = client.get("/api/v1/oni?debut=2000-01-01&fin=2010-12-31")
    assert response.status_code == 200
    observations = response.json()
    
    # Vérifier que les observations sont dans la plage
    for obs in observations:
        assert "2000-01-01" <= obs["date_centrale"] <= "2010-12-31"
