import logging

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from app.schemas.response import ErrorResponse
from app.config.settings import settings

logger = logging.getLogger(__name__)


# ============================================================
# Base Exception
# ============================================================

class FaceIDException(Exception):
    """Base exception for FaceID Service."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


# ============================================================
# Custom Exceptions
# ============================================================

class InvalidImageError(FaceIDException):
    """Invalid or corrupt image."""


class NoFaceDetectedError(FaceIDException):
    """No face detected."""


class MultipleFacesDetectedError(FaceIDException):
    """More than one face detected."""


class BlurredImageError(FaceIDException):
    """Image quality is too poor."""


class UserNotEnrolledError(FaceIDException):
    """User has no enrolled face."""


class DatabaseError(FaceIDException):
    """Database operation failed."""


class InvalidTokenException(FaceIDException):
    def __init__(self, detail: str = "Invalid token"):
        self.detail = detail
        super().__init__(detail)

class ExpiredTokenException(FaceIDException):
    def __init__(self, detail: str = "Token has expired"):
        self.detail = detail
        super().__init__(detail)

class InvalidAudienceException(FaceIDException):
    def __init__(self, detail: str = "Invalid audience or issuer"):
        self.detail = detail
        super().__init__(detail)

class MatchFailedError(FaceIDException):
    def __init__(self, detail: str = "Face match failed"):
        self.detail = detail
        super().__init__(detail)


# ============================================================
# Exception Handlers
# ============================================================

def setup_exception_handlers(app: FastAPI) -> None:
    """
    Register global exception handlers.
    """

    @app.exception_handler(InvalidImageError)
    async def invalid_image_handler(
        request: Request,
        exc: InvalidImageError,
    ):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "INVALID_IMAGE",
                "message": exc.message,
            },
        )

    @app.exception_handler(NoFaceDetectedError)
    async def no_face_handler(
        request: Request,
        exc: NoFaceDetectedError,
    ):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "NO_FACE_DETECTED",
                "message": exc.message,
            },
        )

    @app.exception_handler(MultipleFacesDetectedError)
    async def multiple_faces_handler(
        request: Request,
        exc: MultipleFacesDetectedError,
    ):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "MULTIPLE_FACES_DETECTED",
                "message": exc.message,
            },
        )

    @app.exception_handler(BlurredImageError)
    async def blurred_handler(
        request: Request,
        exc: BlurredImageError,
    ):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "BLURRED_IMAGE",
                "message": exc.message,
            },
        )

    @app.exception_handler(UserNotEnrolledError)
    async def user_not_found_handler(
        request: Request,
        exc: UserNotEnrolledError,
    ):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={
                "success": False,
                "error": "USER_NOT_ENROLLED",
                "message": exc.message,
            },
        )
        
    @app.exception_handler(MatchFailedError)
    async def match_failed_handler(
        request: Request,
        exc: MatchFailedError,
    ):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "error": "MATCH_FAILED",
                "message": exc.message,
            },
        )

    @app.exception_handler(InvalidTokenException)
    async def invalid_token_handler(
        request: Request,
        exc: InvalidTokenException,
    ):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "error": "INVALID_TOKEN",
                "message": exc.message,
            },
        )

    @app.exception_handler(ExpiredTokenException)
    async def expired_token_handler(
        request: Request,
        exc: ExpiredTokenException,
    ):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "error": "EXPIRED_TOKEN",
                "message": exc.message,
            },
        )

    @app.exception_handler(InvalidAudienceException)
    async def invalid_audience_handler(
        request: Request,
        exc: InvalidAudienceException,
    ):
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={
                "success": False,
                "error": "INVALID_AUDIENCE",
                "message": exc.message,
            },
        )

    @app.exception_handler(DatabaseError)
    async def database_handler(
        request: Request,
        exc: DatabaseError,
    ):
        logger.exception(exc)

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": "DATABASE_ERROR",
                "message": exc.message,
            },
        )

    @app.exception_handler(FaceIDException)
    async def faceid_handler(
        request: Request,
        exc: FaceIDException,
    ):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": "FACEID_ERROR",
                "message": exc.message,
            },
        )

    @app.exception_handler(Exception)
    async def generic_handler(
        request: Request,
        exc: Exception,
    ):
        logger.exception(exc)

        response = {
            "success": False,
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred.",
        }

        if settings.debug:
            response["details"] = str(exc)

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=response,
        )