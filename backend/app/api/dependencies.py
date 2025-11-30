"""Shared API dependencies."""

from typing import Optional
from app.models.domain import User
from app.services import database as db

def get_current_user() -> Optional[User]:
    """Get the current authenticated user."""
    return db.current_user
