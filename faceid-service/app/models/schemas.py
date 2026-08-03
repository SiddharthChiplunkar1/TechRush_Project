from pydantic import BaseModel
from typing import Optional

class FaceEnrollRequest(BaseModel):
    userId: str
    imageBase64: str

class FaceVerifyRequest(BaseModel):
    userId: str
    imageBase64: str

class FaceVerifyResult(BaseModel):
    matched: bool
    confidence: float
    live: bool
    error: Optional[str] = None
