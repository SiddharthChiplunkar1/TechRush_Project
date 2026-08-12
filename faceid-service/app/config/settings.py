from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Tuple, Optional
import base64


class Settings(BaseSettings):
    """
    Application configuration.
    Loaded automatically from environment variables and .env.
    Environment variables (e.g. from docker-compose) take priority over .env.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ============================================================
    # Database
    # ============================================================
    # Can fallback to SQLite for local tests
    database_url: str = "sqlite:///./faceid.db"

    # ============================================================
    # JWT
    # ============================================================

    jwt_secret: str = ""
    jwt_algorithm: str = "HS256"
    jwt_audience: str = "techrush-app"
    jwt_issuer: str = "TechRush"
    faceid_service_token: str = ""
    face_matcher: str = "arcface"
    insightface_model: str = "buffalo_l"
    insightface_root: str = "/models/insightface"

    # ============================================================
    # Service Config
    # ============================================================
    
    similarity_threshold: float = 0.78
    verify_similarity_threshold: float = 0.78
    live_blink_threshold: float = 0.21
    live_motion_threshold: float = 0.012
    max_image_bytes: int = 5 * 1024 * 1024
    max_verify_attempts: int = 10
    max_verify_window_seconds: int = 60
    max_enroll_attempts: int = 5
    max_enroll_window_seconds: int = 60
    allowed_origins: str = ""
    debug: bool = False
    log_level: str = "INFO"

    @field_validator("jwt_secret")
    @classmethod
    def validate_jwt_secret(cls, value: str) -> str:
        if not value:
            return value
        if len(value.encode("utf-8")) < 32:
            raise ValueError("JWT secret must be at least 32 bytes")
        return value


settings = Settings()
