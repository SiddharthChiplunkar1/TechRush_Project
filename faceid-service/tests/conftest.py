import os

os.environ.setdefault("JWT_SECRET", "test-jwt-secret-test-jwt-secret-32b")
os.environ["DEBUG"] = "false"
os.environ.setdefault("DATABASE_URL", "sqlite:///./test.db")
os.environ.setdefault("FACEID_SERVICE_TOKEN", "test-faceid-service-token")

import numpy as np
import pytest

from app.services.face_service import FaceService

VALID_IMAGE_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAHUlEQVQoU2NkYGD4z0AEYBxVSFUB"
    "CjAyYgEAGn8C/9H6k9IAAAAASUVORK5CYII="
)


@pytest.fixture(autouse=True)
def _mock_valid_image(monkeypatch):
    image = np.indices((160, 160)).sum(axis=0) % 2
    image = (image * 255).astype(np.uint8)
    image = np.stack([image, image, image], axis=-1)

    monkeypatch.setattr(
        FaceService,
        "_decode_and_validate",
        lambda self, image_base64: image.copy(),
    )
