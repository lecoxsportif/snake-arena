"""Application configuration."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    """Application settings."""
    
    APP_NAME: str = "Snake Arena API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "API for Snake Arena game"
    
    # API settings
    API_PREFIX: str = "/api"
    
    # Database settings
    DATABASE_URL: str = "sqlite+aiosqlite:///./snake_arena.db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None) -> str:
        if not v:
            return "sqlite+aiosqlite:///./snake_arena.db"
        # Render/Heroku provide postgres:// which implies psycopg2, but we use asyncpg
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+asyncpg://", 1)
        if v.startswith("postgresql://") and "+asyncpg" not in v:
             return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v
    
    # CORS settings
    # Default to valid list, but allow override via ALLOWED_ORIGINS env var
    ALLOWED_ORIGINS: str = "http://localhost:8080,http://127.0.0.1:8080"
    
    # Allow Codespaces domains
    CORS_ORIGIN_REGEX: str = r"https://.*\.app\.github\.dev|https://.*\.github\.dev"
    
    @property
    def CORS_ORIGINS(self) -> list[str]:
        """Parse ALLOWED_ORIGINS into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()
