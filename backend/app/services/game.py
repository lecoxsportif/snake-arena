"""Game-related business logic."""

from typing import Optional
from app.models.domain import User, LeaderboardEntry, GameMode
from app.services import database as db

def submit_game_score(user: User, score: int, mode: GameMode) -> LeaderboardEntry:
    """Submit a game score for a user."""
    return db.submit_score(user, score, mode)

def get_game_leaderboard(mode: Optional[GameMode] = None) -> list[LeaderboardEntry]:
    """Get the game leaderboard, optionally filtered by mode."""
    return db.get_leaderboard(mode)
