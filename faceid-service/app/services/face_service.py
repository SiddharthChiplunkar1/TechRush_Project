import logging
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.repository.face_repository import FaceRepository
from app.services.matcher import OpenCVFaceMatcher
from app.config.settings import settings
from app.exceptions.handlers import (
    UserNotEnrolledError,
    MatchFailedError,
    DatabaseError
)

logger = logging.getLogger(__name__)

class FaceService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = FaceRepository(db)
        self.matcher = OpenCVFaceMatcher()

    def enroll(self, user_id: str, image_base64: str) -> Dict[str, Any]:
        """
        Extracts face embedding and saves to DB.
        """
        # 1. Extract embedding using Mock OpenCV Matcher
        # Will raise NoFaceDetectedError, MultipleFacesDetectedError, or InvalidImageError
        embedding_str = self.matcher.extract_embedding(image_base64)

        # 2. Store in repository
        saved = self.repository.enroll_face(user_id, embedding_str)
        
        return {
            "success": True,
            "message": "Face enrolled successfully",
            "user_id": user_id,
            "embedding_id": saved.id,
        }

    def verify(self, user_id: str, image_base64: str) -> Dict[str, Any]:
        """
        Verifies face against user's saved embeddings.
        """
        # 1. Fetch user's stored embeddings
        embeddings = self.repository.get_user_embeddings(user_id)
        if not embeddings:
            raise UserNotEnrolledError(f"User {user_id} has no enrolled face data.")

        # 2. Verify against the embeddings
        # For simplicity, we check against all saved embeddings and see if any pass
        best_similarity = 0.0
        match = False
        
        for record in embeddings:
            try:
                # verify returns similarity float or raises MatchFailedError
                similarity = self.matcher.verify(
                    image_base64, 
                    record.embedding, 
                    threshold=settings.similarity_threshold
                )
                if similarity > best_similarity:
                    best_similarity = similarity
                    match = True
            except MatchFailedError:
                pass # Try next embedding
                
        if not match:
            raise MatchFailedError("Face did not match enrolled embeddings")
            
        return {
            "success": True,
            "match": match,
            "similarity": best_similarity,
            "message": "Face match successful",
        }