"""Application configuration."""

class Settings:
    """Application settings."""
    
    APP_NAME: str = "Snake Arena API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "API for Snake Arena game"
    
    # CORS settings
    CORS_ORIGINS: list[str] = ["http://localhost:8080", "http://127.0.0.1:8080", "http://localhost:8081", "http://127.0.0.1:8081", "http://localhost:8082", "http://127.0.0.1:8082"]  # Frontend dev server origins
    
    # API settings
    API_PREFIX: str = "/api"

settings = Settings()
