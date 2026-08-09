import logging
from typing import Optional

from fastapi import Depends, Header, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

from app.config.settings import settings
from app.exceptions.handlers import (
    InvalidTokenException,
    ExpiredTokenException,
    InvalidAudienceException,
)

logger = logging.getLogger(__name__)

security = HTTPBearer(auto_error=False)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Validates JWT token using python-jose.
    Requires audience and issuer explicitly to match constraints.
    Returns decoded payload.
    """
    if credentials is None:
        return None

    token = credentials.credentials
    try:
        # Note: the secret is NOT base64-decoded as per requirements.
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            audience=settings.jwt_audience,
            issuer=settings.jwt_issuer,
        )
    except jwt.ExpiredSignatureError:
        logger.warning("Expired JWT rejected")
        raise ExpiredTokenException()
    except jwt.JWTClaimsError:
        raise InvalidAudienceException()
    except JWTError:
        raise InvalidTokenException()
    except Exception:
        raise InvalidTokenException()

    aud_claim = payload.get("aud")
    if not aud_claim:
        raise InvalidAudienceException(detail="Token is missing audience")
        
    if isinstance(aud_claim, list):
        if settings.jwt_audience not in aud_claim:
            raise InvalidAudienceException(detail="Token has invalid audience")
    elif aud_claim != settings.jwt_audience:
        raise InvalidAudienceException(detail="Token has invalid audience")

    if "iss" not in payload or payload["iss"] != settings.jwt_issuer:
        raise InvalidAudienceException(detail="Token is missing issuer or has invalid issuer")
        
    return payload


def get_current_user(request: Request, payload: dict = Depends(verify_token)):
    """
    Extracts user info from validated token and adds to request.state.
    """
    if payload is None:
        raise InvalidTokenException(detail="Missing authentication")

    user_id = payload.get("userId")
    if not user_id:
        logger.error("Token missing userId claim")
        raise InvalidTokenException(detail="Missing userId claim")
        
    email = payload.get("sub")
    role = payload.get("role")
    auth_level = payload.get("authLevel")

    request.state.user_id = user_id
    request.state.email = email
    request.state.role = role
    request.state.auth_level = auth_level

    return {
        "user_id": user_id,
        "email": email,
        "role": role,
        "auth_level": auth_level
    }


def verify_service_token(
    x_service_token: Optional[str] = Header(None, alias="X-Service-Token")
):
    expected = settings.faceid_service_token.strip()
    if not x_service_token:
        return None
    if not expected:
        raise InvalidTokenException(detail="Service token not configured")
    if x_service_token != expected:
        raise InvalidTokenException(detail="Invalid service token")
    return {"service": True}
