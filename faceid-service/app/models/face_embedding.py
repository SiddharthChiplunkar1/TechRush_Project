from sqlalchemy import (
    Column,
    String,
    DateTime,
    Integer,
    Float,
    JSON,
    Boolean,
    Index,
)
from sqlalchemy.sql import func

from app.config.database import Base


class FaceEmbedding(Base):
    """
    Stores one face embedding for a user.

    Each user can have multiple embeddings captured under different
    lighting conditions and poses.
    """

    __tablename__ = "face_embeddings"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(String(255), nullable=False, index=True)

    # 512-dimensional embedding
    embedding = Column(JSON, nullable=False)

    quality_score = Column(Float, nullable=False)

    image_hash = Column(String(64), nullable=True)

    active = Column(Boolean, nullable=False, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    __table_args__ = (
        Index("idx_user_quality", "user_id", "quality_score"),
        Index("idx_user_active", "user_id", "active"),
    )

    def __repr__(self):
        return (
            f"<FaceEmbedding("
            f"user={self.user_id}, "
            f"quality={self.quality_score:.3f})>"
        )