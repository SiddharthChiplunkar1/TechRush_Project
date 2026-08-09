import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from app.config.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from tests.test_auth import create_token
from app.exceptions.handlers import MatchFailedError
from tests.conftest import VALID_IMAGE_BASE64

# Setup test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)
SERVICE_HEADERS = {"X-Service-Token": "test-faceid-service-token"}

@pytest.fixture(autouse=True)
def cleanup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@patch("app.services.matcher.OpenCVFaceMatcher.extract_embedding")
def test_enroll_success(mock_extract):
    mock_extract.return_value = "mocked_embedding_base64_str"
    token = create_token(user_id="user-123")
    
    response = client.post(
        "/api/face/enroll",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["message"] == "Face enrolled successfully"
    assert data["user_id"] == "user-123"
    assert "embedding_id" in data


@patch("app.services.matcher.OpenCVFaceMatcher.extract_embedding")
@patch("app.services.matcher.OpenCVFaceMatcher.verify")
def test_verify_success(mock_verify, mock_extract):
    # Setup - enroll first
    mock_extract.return_value = "mocked_embedding_base64_str"
    token = create_token(user_id="user-123")
    
    client.post(
        "/api/face/enroll",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    
    # Mock verify
    mock_verify.return_value = 0.95
    
    # Test verify
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["match"] is True
    assert data["similarity"] == 0.95


def test_verify_not_enrolled():
    token = create_token(user_id="user-404")
    
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    
    assert response.status_code == 404
    assert response.json()["error"] == "USER_NOT_ENROLLED"


@patch("app.services.matcher.OpenCVFaceMatcher.extract_embedding")
@patch("app.services.matcher.OpenCVFaceMatcher.verify")
def test_verify_failure(mock_verify, mock_extract):
    mock_extract.return_value = "mocked_embedding_base64_str"
    token = create_token(user_id="user-123")
    
    # Enroll
    client.post(
        "/api/face/enroll",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    
    # Mock verify to throw MatchFailedError
    mock_verify.side_effect = MatchFailedError("Similarity below threshold")
    
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    
    assert response.status_code == 401
    assert response.json()["error"] == "MATCH_FAILED"
