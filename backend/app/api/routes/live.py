"""Live player routes."""

from fastapi import APIRouter
from app.models.schemas import ApiResponse
from app.services import database as db

router = APIRouter(prefix="/live", tags=["live"])

@router.get("/players")
async def get_active_players() -> ApiResponse:
    """Get list of active players."""
    players = db.get_active_players()
    
    return ApiResponse(
        success=True,
        error=None,
        data=[p.model_dump() for p in players]
    )

@router.get("/players/{player_id}")
async def get_player_stream(player_id: str) -> ApiResponse:
    """Get specific player's game stream."""
    player = db.get_player_by_id(player_id)
    
    if not player:
        return ApiResponse(
            success=False,
            error="Player not found",
            data=None
        )
    
    return ApiResponse(
        success=True,
        error=None,
        data=player.model_dump()
    )
