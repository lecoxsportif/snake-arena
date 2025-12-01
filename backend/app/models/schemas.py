"""API request/response schemas."""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.domain import GameMode

class AuthCredentials(BaseModel):
    """Authentication credentials."""
    email: EmailStr
    password: str
    username: Optional[str] = None

class UserResponse(BaseModel):
    """User response (excludes password)."""
    id: str
    username: str
    email: EmailStr
    highScore: int
    gamesPlayed: int
    createdAt: datetime

class ScoreSubmission(BaseModel):
    """Score submission request."""
    score: int
    mode: GameMode

class ApiResponse(BaseModel):
    """Standard API response wrapper."""
    success: bool
    error: Optional[str] = None
    data: Optional[object] = None

