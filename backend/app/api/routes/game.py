"""Game routes."""

from fastapi import APIRouter, Depends, Cookie
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import ApiResponse, ScoreSubmission
from app.models.domain import GameMode
from app.services import database as db, game
from app.core.database import get_db

router = APIRouter(prefix="/game", tags=["game"])

@router.post("/score")
async def submit_score(
    submission: ScoreSubmission,
    db_session: AsyncSession = Depends(get_db),
    snake_session: Optional[str] = Cookie(None)
) -> ApiResponse:
    """Submit a game score."""
    if not snake_session:
        return ApiResponse(
            success=False,
            error="Must be logged in to submit score",
            data=None
        )
        
    user = await db.get_user_by_session_token(db_session, snake_session)
    if not user:
        return ApiResponse(
            success=False,
            error="Must be logged in to submit score",
            data=None
        )
    
    entry = await game.submit_game_score(db_session, user, submission.score, submission.mode)
    
    return ApiResponse(
        success=True,
        error=None,
        data=entry.model_dump()
    )

@router.get("/leaderboard")
async def get_leaderboard(
    mode: Optional[GameMode] = None,
    db_session: AsyncSession = Depends(get_db)
) -> ApiResponse:
    """Get leaderboard entries, optionally filtered by game mode."""
    entries = await game.get_game_leaderboard(db_session, mode)
    
    return ApiResponse(
        success=True,
        error=None,
        data=[e.model_dump() for e in entries]
    )
