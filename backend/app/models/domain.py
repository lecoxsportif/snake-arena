"""Domain models for the application."""

from enum import Enum
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict
from pydantic.alias_generators import to_camel

class Direction(str, Enum):
    """Snake movement direction."""
    UP = 'UP'
    DOWN = 'DOWN'
    LEFT = 'LEFT'
    RIGHT = 'RIGHT'

class GameMode(str, Enum):
    """Game mode."""
    WALLS = 'walls'
    PASS_THROUGH = 'pass-through'

class GameStatus(str, Enum):
    """Game status."""
    IDLE = 'idle'
    PLAYING = 'playing'
    PAUSED = 'paused'
    GAME_OVER = 'game-over'

class Position(BaseModel):
    """Position on the game grid."""
    x: int
    y: int

class GameState(BaseModel):
    """Current state of a game."""
    snake: list[Position]
    food: Position
    direction: Direction
    score: int
    status: GameStatus
    mode: GameMode
    speed: int

class User(BaseModel):
    """User model."""
    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        alias_generator=to_camel
    )
    
    id: str
    username: str
    email: EmailStr
    password: str  # In production, this should be hashed
    high_score: int
    games_played: int
    created_at: datetime

class LeaderboardEntry(BaseModel):
    """Leaderboard entry."""
    id: str
    username: str
    score: int
    mode: GameMode
    date: str  # YYYY-MM-DD
    rank: int

class ActivePlayer(BaseModel):
    """Active player in a game."""
    id: str
    username: str
    currentScore: int
    mode: GameMode
    gameState: GameState
    startedAt: datetime
