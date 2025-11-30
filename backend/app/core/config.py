"""Application configuration."""

class Settings:
    """Application settings."""
    
    APP_NAME: str = "Snake Arena API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "API for Snake Arena game"
    
    # CORS settings
    CORS_ORIGINS: list[str] = ["*"]  # In production, specify actual origins
    
    # API settings
    API_PREFIX: str = "/api"

settings = Settings()
