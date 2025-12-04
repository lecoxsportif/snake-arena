"""Database service."""

from datetime import datetime
from typing import Optional
from sqlalchemy import select, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.domain import (
    User, LeaderboardEntry, ActivePlayer, GameState, 
    Position, Direction, GameMode, GameStatus
)
from app.models.sql import User as DBUser, Score as DBScore
import random

# In-memory storage for active players (ephemeral game state)
active_players: list[ActivePlayer] = []

# In-memory session storage (token -> user_id)
sessions: dict[str, str] = {}

# Database operations
async def get_user_by_session_token(db: AsyncSession, token: str) -> Optional[User]:
    """Get user by session token."""
    user_id = sessions.get(token)
    if not user_id:
        return None
        
    result = await db.execute(select(DBUser).where(DBUser.id == user_id))
    db_user = result.scalar_one_or_none()
    if db_user:
        return User.model_validate(db_user)
    return None

async def create_session(user_id: str) -> str:
    """Create a new session for user."""
    import uuid
    token = str(uuid.uuid4())
    sessions[token] = user_id
    return token

async def delete_session(token: str) -> None:
    """Delete a session."""
    if token in sessions:
        del sessions[token]

async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """Get user by email."""
    result = await db.execute(select(DBUser).where(DBUser.email == email))
    db_user = result.scalar_one_or_none()
    if db_user:
        return User.model_validate(db_user)
    return None

async def get_user_by_username(db: AsyncSession, username: str) -> Optional[User]:
    """Get user by username."""
    result = await db.execute(select(DBUser).where(DBUser.username == username))
    db_user = result.scalar_one_or_none()
    if db_user:
        return User.model_validate(db_user)
    return None

async def create_user(db: AsyncSession, email: str, username: str, password: str) -> User:
    """Create a new user."""
    # Generate a simple ID (in production, use UUID or let DB handle it)
    # For SQLite/Postgres with string ID, we can use UUID
    import uuid
    user_id = str(uuid.uuid4())
    
    db_user = DBUser(
        id=user_id,
        username=username,
        email=email,
        password=password,
        high_score=0,
        games_played=0,
        created_at=datetime.now()
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return User.model_validate(db_user)

async def get_leaderboard(db: AsyncSession, mode: Optional[GameMode] = None) -> list[LeaderboardEntry]:
    """Get leaderboard entries, optionally filtered by mode."""
    query = select(DBScore).order_by(desc(DBScore.score)).limit(10)
    
    if mode:
        query = query.where(DBScore.mode == mode)
        
    result = await db.execute(query)
    scores = result.scalars().all()
    
    entries = []
    for i, score in enumerate(scores):
        entries.append(LeaderboardEntry(
            id=str(score.id),
            username=score.username,
            score=score.score,
            mode=GameMode(score.mode) if score.mode in [m.value for m in GameMode] else GameMode.WALLS,
            date=score.date.strftime('%Y-%m-%d'),
            rank=i + 1
        ))
    return entries

async def submit_score(db: AsyncSession, user: User, score: int, mode: GameMode) -> LeaderboardEntry:
    """Submit a score to the leaderboard."""
    # Create score entry
    db_score = DBScore(
        user_id=user.id,
        username=user.username,
        score=score,
        mode=mode,
        date=datetime.now()
    )
    db.add(db_score)
    
    # Update user stats
    # We need to fetch the DB user to update it attached to session
    result = await db.execute(select(DBUser).where(DBUser.id == user.id))
    db_user = result.scalar_one()
    
    if score > db_user.high_score:
        db_user.high_score = score
    
    db_user.games_played += 1
    
    await db.commit()
    await db.refresh(db_score)
    
    # Calculate rank (simplified, just count how many scores are higher)
    # For a real leaderboard, we might want a separate query or cache
    rank_result = await db.execute(
        select(func.count()).select_from(DBScore).where(DBScore.score > score)
    )
    rank = rank_result.scalar_one() + 1
    
    return LeaderboardEntry(
        id=str(db_score.id),
        username=db_score.username,
        score=db_score.score,
        mode=mode,
        date=db_score.date.strftime('%Y-%m-%d'),
        rank=rank
    )

# Active player operations (In-memory)
def generate_ai_game_state() -> GameState:
    """Generate a random AI game state."""
    return GameState(
        snake=[
            Position(x=10, y=10),
            Position(x=9, y=10),
            Position(x=8, y=10),
        ],
        food=Position(x=random.randint(0, 19), y=random.randint(0, 19)),
        direction=Direction.RIGHT,
        score=random.randint(0, 500),
        status=GameStatus.PLAYING,
        mode=random.choice([GameMode.WALLS, GameMode.PASS_THROUGH]),
        speed=150
    )

def get_active_players() -> list[ActivePlayer]:
    """Get all active players."""
    # Update scores with some variation
    for player in active_players:
        player.currentScore += random.randint(0, 10)
        player.gameState.score += random.randint(0, 10)
    return active_players

def get_player_by_id(player_id: str) -> Optional[ActivePlayer]:
    """Get a specific active player by ID."""
    return next((p for p in active_players if p.id == player_id), None)
