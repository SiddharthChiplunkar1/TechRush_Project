from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.models.schemas import FaceEnrollRequest, FaceVerifyRequest, FaceVerifyResult
from app.services.face_service import FaceService

router = APIRouter()

# Dependency injection
def get_face_service():
    return FaceService()

@router.post("/enroll", status_code=200)
def enroll_face(request: FaceEnrollRequest, service: FaceService = Depends(get_face_service)):
    """
    Enrolls a user's face by extracting the embedding and saving it to disk.
    """
    try:
        service.enroll_user(request.userId, request.imageBase64)
        return {"status": "success", "message": "Face enrolled successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during face enrollment")

@router.post("/verify", response_model=FaceVerifyResult)
def verify_face(request: FaceVerifyRequest, service: FaceService = Depends(get_face_service)):
    """
    Verifies a user's face against their enrolled embedding.
    """
    try:
        is_match, confidence, is_live = service.verify_user(request.userId, request.imageBase64)
        return FaceVerifyResult(
            matched=is_match,
            confidence=confidence,
            live=is_live
        )
    except ValueError as e:
        # e.g., Not enrolled, multiple faces
        return FaceVerifyResult(
            matched=False,
            confidence=0.0,
            live=False,
            error=str(e)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during face verification")
