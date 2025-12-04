"""Game-related business logic."""

from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.domain import User, LeaderboardEntry, GameMode
from app.services import database as db

async def submit_game_score(db_session: AsyncSession, user: User, score: int, mode: GameMode) -> LeaderboardEntry:
    """Submit a game score for a user."""
    return await db.submit_score(db_session, user, score, mode)

async def get_game_leaderboard(db_session: AsyncSession, mode: Optional[GameMode] = None) -> list[LeaderboardEntry]:
    """Get the game leaderboard, optionally filtered by mode."""
    return await db.get_leaderboard(db_session, mode)
