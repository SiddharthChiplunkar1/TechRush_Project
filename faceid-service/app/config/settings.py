from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Tuple


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

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_audience: str = "techrush-app"
    jwt_issuer: str = "TechRush"

    # ============================================================
    # Service Config
    # ============================================================
    
    similarity_threshold: float = 0.60
    debug: bool = False
    log_level: str = "INFO"


settings = Settings()