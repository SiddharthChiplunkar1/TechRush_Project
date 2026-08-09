from typing import Optional, List

from fastapi import APIRouter, Depends, Header, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.exceptions.handlers import InvalidTokenException
from app.middleware.auth_middleware import get_current_user, verify_service_token, verify_token
from app.services.face_service import FaceService

router = APIRouter(tags=["Face Authentication"])


class EnrollRequest(BaseModel):
    image_base64: str = Field(min_length=20)


class VerifyRequest(BaseModel):
    image_base64: str = Field(min_length=20)


class VerifyLiveRequest(BaseModel):
    frames: List[str] = Field(min_length=3, max_length=15)


def get_face_service(db: Session = Depends(get_db)) -> FaceService:
    return FaceService(db)


def resolve_user_id(
    payload: Optional[dict] = Depends(verify_token),
    _service: Optional[dict] = Depends(verify_service_token),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
) -> str:
    if payload is not None:
        user_id = payload.get("userId")
        if not user_id:
            raise InvalidTokenException(detail="Missing user identity")
        if x_user_id and x_user_id != user_id:
            raise InvalidTokenException(detail="User mismatch")
        return user_id

    if _service is not None and x_user_id:
        return x_user_id

    raise InvalidTokenException(detail="Missing authentication")


@router.post("/enroll", status_code=status.HTTP_200_OK)
async def enroll(
    enroll_request: EnrollRequest,
    user_id: str = Depends(resolve_user_id),
    service: FaceService = Depends(get_face_service),
):
    return service.enroll(user_id=user_id, image_base64=enroll_request.image_base64)


@router.post("/verify", status_code=status.HTTP_200_OK)
async def verify(
    verify_request: VerifyRequest,
    user_id: str = Depends(resolve_user_id),
    service: FaceService = Depends(get_face_service),
):
    return service.verify(user_id=user_id, image_base64=verify_request.image_base64)


@router.post("/verify-live", status_code=status.HTTP_200_OK)
async def verify_live(
    verify_request: VerifyLiveRequest,
    user_id: str = Depends(resolve_user_id),
    service: FaceService = Depends(get_face_service),
):
    return service.verify_live(user_id=user_id, frames=verify_request.frames)
