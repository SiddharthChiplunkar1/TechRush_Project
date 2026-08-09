from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.face_embedding import FaceEmbedding
from app.exceptions.handlers import DatabaseError
import logging

logger = logging.getLogger(__name__)

class FaceRepository:
    def __init__(self, db: Session):
        self.db = db

    def enroll_face(self, user_id: str, embedding_str: str) -> FaceEmbedding:
        """
        Stores a face embedding for a user.
        Uses the embedding_str as a JSON value (e.g. base64 string or list).
        """
        try:
            face_embed = FaceEmbedding(
                user_id=user_id,
                embedding=embedding_str, # Using string since JSON can hold it
                quality_score=1.0, # default mock quality
                active=True
            )
            self.db.query(FaceEmbedding).filter(
                FaceEmbedding.user_id == user_id,
                FaceEmbedding.active.is_(True),
            ).update({"active": False}, synchronize_session=False)
            self.db.add(face_embed)
            self.db.commit()
            self.db.refresh(face_embed)
            return face_embed
        except Exception as e:
            self.db.rollback()
            logger.error(f"Failed to enroll face for user {user_id}: {e}")
            raise DatabaseError("Could not save face embedding")

    def get_user_embeddings(self, user_id: str) -> List[FaceEmbedding]:
        """
        Retrieves all active face embeddings for a user.
        """
        try:
            return self.db.query(FaceEmbedding).filter(
                FaceEmbedding.user_id == user_id,
                FaceEmbedding.active.is_(True)
            ).all()
        except Exception as e:
            logger.error(f"Failed to retrieve embeddings for user {user_id}: {e}")
            raise DatabaseError("Could not retrieve face embeddings")

    def count_active_embeddings(self, user_id: str) -> int:
        return self.db.query(FaceEmbedding).filter(
            FaceEmbedding.user_id == user_id,
            FaceEmbedding.active.is_(True)
        ).count()
