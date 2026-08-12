import logging
import time
from collections import defaultdict, deque
from typing import Any, Dict, List

import numpy as np
from sqlalchemy.orm import Session

from app.config.settings import settings
from app.exceptions.handlers import (
    MatchFailedError,
    NoFaceDetectedError,
    UserNotEnrolledError,
)
from app.repository.face_repository import FaceRepository
from app.services.matcher import ArcFaceMatcher, OpenCVFaceMatcher
from app.utils.image_utils import decode_base64_image, validate_image_quality, compute_image_hash

logger = logging.getLogger(__name__)


class FaceService:
    _attempts: dict[str, deque[float]] = defaultdict(deque)

    def __init__(self, db: Session):
        self.db = db
        self.repository = FaceRepository(db)
        if settings.face_matcher.lower() == "opencv":
            self.matcher = OpenCVFaceMatcher()
        else:
            self.matcher = ArcFaceMatcher()

    def enroll(self, user_id: str, image_base64: str) -> Dict[str, Any]:
        self._check_rate_limit(f"enroll:{user_id}", settings.max_enroll_attempts, settings.max_enroll_window_seconds)
        image = self._decode_and_validate(image_base64)
        quality_ok, quality_score = validate_image_quality(image)
        if not quality_ok:
            raise MatchFailedError("Image quality is too low")

        embedding_str = self.matcher.extract_embedding(image_base64)
        saved = self.repository.enroll_face(user_id, embedding_str)
        logger.info("Face enrolled for user %s", self._mask(user_id))
        return {
            "success": True,
            "message": "Face enrolled successfully",
            "user_id": user_id,
            "embedding_id": saved.id,
            "quality_score": quality_score,
        }

    def enroll_live(self, user_id: str, frames: List[str]) -> Dict[str, Any]:
        """Require a live frame burst before persisting the enrollment template."""
        if len(frames) < 5:
            raise MatchFailedError("Liveness verification requires multiple frames")
        if not self._assess_liveness(frames):
            raise MatchFailedError("Liveness verification failed")
        return self.enroll(user_id=user_id, image_base64=frames[-1])

    def verify(self, user_id: str, image_base64: str) -> Dict[str, Any]:
        self._check_rate_limit(f"verify:{user_id}", settings.max_verify_attempts, settings.max_verify_window_seconds)
        embeddings = self.repository.get_user_embeddings(user_id)
        if not embeddings:
            raise UserNotEnrolledError("No enrolled face data found")

        image = self._decode_and_validate(image_base64)
        quality_ok, _ = validate_image_quality(image)
        if not quality_ok:
            raise MatchFailedError("Face verification failed")

        best_similarity = 0.0
        for record in embeddings:
            try:
                similarity = self.matcher.verify(image_base64, record.embedding, threshold=settings.verify_similarity_threshold)
                best_similarity = max(best_similarity, similarity)
            except MatchFailedError:
                continue

        if best_similarity < settings.verify_similarity_threshold:
            raise MatchFailedError("Face verification failed")

        return {
            "success": True,
            "match": True,
            "matched": True,
            "similarity": best_similarity,
            "message": "Face verification successful",
        }

    def verify_live(self, user_id: str, frames: List[str]) -> Dict[str, Any]:
        self._check_rate_limit(f"live:{user_id}", settings.max_verify_attempts, settings.max_verify_window_seconds)
        if len(frames) < 3:
            raise MatchFailedError("Liveness verification requires multiple frames")

        live_score = self._assess_liveness(frames)
        if live_score is False:
            raise MatchFailedError("Liveness verification failed")

        result = self.verify(user_id=user_id, image_base64=frames[-1])
        result.update({
            "live": True,
            "message": "Face and liveness verification successful",
        })
        return result

    def _decode_and_validate(self, image_base64: str):
        image = decode_base64_image(image_base64)
        if image is None or image.size == 0:
            raise NoFaceDetectedError("No face detected in the image")
        if image.shape[0] * image.shape[1] * 3 > settings.max_image_bytes:
            raise MatchFailedError("Image too large")
        return image

    def _assess_liveness(self, frames: List[str]) -> bool:
        # Require one face in every frame and measurable movement in the
        # normalized face crop. Hash changes alone are not a liveness signal:
        # JPEG metadata or a replay can make identical stills hash differently.
        crops = []
        for frame in frames:
            self._decode_and_validate(frame)
            crops.append(self.matcher.liveness_signature(frame))

        changes = [float(np.mean(np.abs(current - previous)))
                   for previous, current in zip(crops, crops[1:])]
        return max(changes, default=0.0) >= settings.live_motion_threshold

    def _check_rate_limit(self, key: str, max_attempts: int, window_seconds: int) -> None:
        now = time.time()
        attempts = self._attempts[key]
        while attempts and now - attempts[0] > window_seconds:
            attempts.popleft()
        if len(attempts) >= max_attempts:
            raise MatchFailedError("Too many attempts")
        attempts.append(now)

    def _mask(self, value: str) -> str:
        if not value or len(value) <= 4:
            return "***"
        return "***" + value[-4:]
