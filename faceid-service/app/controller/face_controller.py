from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.exceptions.handlers import ErrorResponse
from app.middleware.auth_middleware import get_current_user
from typing import Any

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.config.database import get_db
from app.exceptions.handlers import ErrorResponse
from app.middleware.auth_middleware import get_current_user
from app.services.face_service import FaceService

router = APIRouter(tags=["Face Authentication"])

# --- Schemas ---

class EnrollRequest(BaseModel):
    image_base64: str

class VerifyRequest(BaseModel):
    image_base64: str

class EnrollResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    embedding_id: int

class VerifyResponse(BaseModel):
    success: bool
    match: bool
    similarity: float
    message: str

# --- Dependencies ---

def get_face_service(
    db: Session = Depends(get_db),
) -> FaceService:
    return FaceService(db)

# --- Routes ---

@router.post(
    "/enroll",
    response_model=EnrollResponse,
    status_code=status.HTTP_200_OK,
    summary="Enroll Face",
)
async def enroll(
    enroll_request: EnrollRequest,
    auth: dict = Depends(get_current_user),
    service: FaceService = Depends(get_face_service),
) -> EnrollResponse:
    user_id = auth["user_id"]
    result = service.enroll(
        user_id=user_id,
        image_base64=enroll_request.image_base64,
    )
    return EnrollResponse(**result)


@router.post(
    "/verify",
    response_model=VerifyResponse,
    status_code=status.HTTP_200_OK,
    summary="Verify Face",
)
async def verify(
    verify_request: VerifyRequest,
    auth: dict = Depends(get_current_user),
    service: FaceService = Depends(get_face_service),
) -> VerifyResponse:
    user_id = auth["user_id"]
    result = service.verify(
        user_id=user_id,
        image_base64=verify_request.image_base64,
    )
    return VerifyResponse(**result)