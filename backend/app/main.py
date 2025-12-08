"""FastAPI application."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, game, live

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(game.router, prefix=settings.API_PREFIX)
app.include_router(live.router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": settings.APP_NAME, "version": settings.VERSION}

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}
