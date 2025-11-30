"""Game routes."""

from fastapi import APIRouter
from typing import Optional
from app.models.schemas import ApiResponse, ScoreSubmission
from app.models.domain import GameMode
from app.services import database as db, game

router = APIRouter(prefix="/game", tags=["game"])

@router.post("/score")
async def submit_score(submission: ScoreSubmission) -> ApiResponse:
    """Submit a game score."""
    if not db.current_user:
        return ApiResponse(
            success=False,
            error="Must be logged in to submit score",
            data=None
        )
    
    entry = game.submit_game_score(db.current_user, submission.score, submission.mode)
    
    return ApiResponse(
        success=True,
        error=None,
        data=entry.model_dump()
    )

@router.get("/leaderboard")
async def get_leaderboard(mode: Optional[GameMode] = None) -> ApiResponse:
    """Get leaderboard entries, optionally filtered by game mode."""
    entries = game.get_game_leaderboard(mode)
    
    return ApiResponse(
        success=True,
        error=None,
        data=[e.model_dump() for e in entries]
    )
