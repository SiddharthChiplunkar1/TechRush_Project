from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "faceid-service"
    version: str = "1.0.0"
    model_loaded: bool = True


class EnrollResponse(BaseModel):
    success: bool
    message: str

    user_id: Optional[str] = None
    embedding_id: Optional[int] = None
    quality_score: Optional[float] = None
    total_embeddings: Optional[int] = None


class VerifyResponse(BaseModel):
    success: bool

    match: bool
    confidence: float
    similarity: float

    message: str

    matched_embedding_id: Optional[int] = None


class VerifyLiveResponse(BaseModel):
    success: bool

    match: bool
    live: bool

    confidence: float
    similarity: float

    message: str

    blink_detected: Optional[bool] = None
    head_movement: Optional[bool] = None


class ErrorResponse(BaseModel):
    success: bool = False

    error: str
    message: str

    timestamp: datetime

    details: Optional[str] = None