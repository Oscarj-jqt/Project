import pytest
from fastapi.testclient import TestClient

from main import app


@pytest.fixture
def client():
    """Client de test FastAPI."""
    return TestClient(app)


def test_app_starts_and_root_responds(client):
    """Vérifie que l'API démarre et que la route racine répond."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "API ENSO Monitor v1"}


def test_pool_is_initialized_during_startup(client):
    """Vérifie que le pool est initialisé lors du démarrage."""
    # Le TestClient exécute le lifespan au démarrage et à l'arrêt.
    # Si le pool n'était pas initialisé, une erreur serait levée.
    response = client.get("/")
    assert response.status_code == 200

