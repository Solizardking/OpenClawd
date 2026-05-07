import pytest
from fastapi.testclient import TestClient

from api.main import app
from api.research import reset_state


@pytest.fixture()
def client() -> TestClient:
    reset_state()
    return TestClient(app)
