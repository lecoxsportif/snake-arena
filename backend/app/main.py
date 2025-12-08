"""FastAPI application."""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, game, live
import os

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

@app.get(f"{settings.API_PREFIX}/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy"}

# Serve static files and SPA fallback
# Only serve if static directory exists (e.g. in production Docker)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve SPA index.html for any other path."""
        # API requests should already be handled by routers above
        if full_path.startswith("api"):
            return {"detail": "Not Found"}
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))

