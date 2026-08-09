import pytest
from datetime import datetime, timedelta
from jose import jwt

from fastapi.testclient import TestClient
from app.main import app
from app.config.settings import settings
from tests.conftest import VALID_IMAGE_BASE64

client = TestClient(app)
SERVICE_HEADERS = {"X-Service-Token": "test-faceid-service-token"}

def create_token(
    user_id="user-123",
    email="test@test.com",
    role="USER",
    auth_level=1,
    audience=settings.jwt_audience,
    issuer=settings.jwt_issuer,
    expires_in_minutes=15,
    secret=settings.jwt_secret,
    algorithm=settings.jwt_algorithm
):
    now = datetime.utcnow()
    payload = {
        "sub": email,
        "userId": user_id,
        "role": role,
        "authLevel": auth_level,
        "iat": now,
        "exp": now + timedelta(minutes=expires_in_minutes),
    }
    if audience:
        payload["aud"] = audience
    if issuer:
        payload["iss"] = issuer

    return jwt.encode(payload, secret, algorithm=algorithm)


def test_auth_missing_audience():
    token = create_token(audience=None)
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    assert response.status_code == 401
    assert response.json()["error"] == "INVALID_AUDIENCE"


def test_auth_wrong_audience():
    token = create_token(audience="wrong-app")
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    assert response.status_code == 401
    assert response.json()["error"] == "INVALID_AUDIENCE"


def test_auth_expired_token():
    token = create_token(expires_in_minutes=-10)
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    assert response.status_code == 401
    assert response.json()["error"] == "EXPIRED_TOKEN"


def test_auth_malformed_token():
    token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.malformed.token"
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    assert response.status_code == 401
    assert response.json()["error"] == "INVALID_TOKEN"


def test_auth_wrong_signature():
    token = create_token(secret="wrong-secret-key")
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    assert response.status_code == 401
    assert response.json()["error"] == "INVALID_TOKEN"


def test_auth_missing_user_id():
    now = datetime.utcnow()
    payload = {
        "sub": "test@test.com",
        # missing userId
        "role": "USER",
        "authLevel": 1,
        "iat": now,
        "exp": now + timedelta(minutes=15),
        "aud": settings.jwt_audience,
        "iss": settings.jwt_issuer
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    response = client.post(
        "/api/face/verify",
        headers={**SERVICE_HEADERS, "Authorization": f"Bearer {token}"},
        json={"image_base64": VALID_IMAGE_BASE64}
    )
    assert response.status_code == 401
    assert response.json()["error"] == "INVALID_TOKEN"
