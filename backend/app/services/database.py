"""Mock database service."""

from datetime import datetime
from typing import Optional
from app.models.domain import (
    User, LeaderboardEntry, ActivePlayer, GameState, 
    Position, Direction, GameMode, GameStatus
)
import random

# Mock database
mock_users: list[User] = [
    User(
        id='1',
        username='PixelMaster',
        email='pixel@game.com',
        highScore=1250,
        gamesPlayed=45,
        createdAt=datetime(2024, 1, 15)
    ),
    User(
        id='2',
        username='NeonNinja',
        email='neon@game.com',
        highScore=980,
        gamesPlayed=32,
        createdAt=datetime(2024, 2, 20)
    ),
    User(
        id='3',
        username='RetroGamer',
        email='retro@game.com',
        highScore=850,
        gamesPlayed=28,
        createdAt=datetime(2024, 3, 10)
    ),
]

mock_leaderboard: list[LeaderboardEntry] = [
    LeaderboardEntry(id='1', username='PixelMaster', score=1250, mode=GameMode.WALLS, date='2024-11-25', rank=1),
    LeaderboardEntry(id='2', username='NeonNinja', score=980, mode=GameMode.PASS_THROUGH, date='2024-11-24', rank=2),
    LeaderboardEntry(id='3', username='RetroGamer', score=850, mode=GameMode.WALLS, date='2024-11-23', rank=3),
    LeaderboardEntry(id='4', username='ArcadeKing', score=720, mode=GameMode.PASS_THROUGH, date='2024-11-22', rank=4),
    LeaderboardEntry(id='5', username='SnakeCharmer', score=650, mode=GameMode.WALLS, date='2024-11-21', rank=5),
    LeaderboardEntry(id='6', username='GameWizard', score=580, mode=GameMode.PASS_THROUGH, date='2024-11-20', rank=6),
    LeaderboardEntry(id='7', username='VintageVictor', score=520, mode=GameMode.WALLS, date='2024-11-19', rank=7),
    LeaderboardEntry(id='8', username='DigitalDragon', score=480, mode=GameMode.PASS_THROUGH, date='2024-11-18', rank=8),
    LeaderboardEntry(id='9', username='CyberSnake', score=420, mode=GameMode.WALLS, date='2024-11-17', rank=9),
    LeaderboardEntry(id='10', username='GlowGamer', score=380, mode=GameMode.PASS_THROUGH, date='2024-11-16', rank=10),
]

current_user: Optional[User] = None

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

mock_active_players: list[ActivePlayer] = [
    ActivePlayer(
        id='ai-1',
        username='NeonNinja',
        currentScore=120,
        mode=GameMode.WALLS,
        gameState=generate_ai_game_state(),
        startedAt=datetime.now()
    ),
    ActivePlayer(
        id='ai-2',
        username='RetroGamer',
        currentScore=85,
        mode=GameMode.PASS_THROUGH,
        gameState=generate_ai_game_state(),
        startedAt=datetime.now()
    ),
]

# Database operations
def get_user_by_email(email: str) -> Optional[User]:
    """Get user by email."""
    return next((u for u in mock_users if u.email == email), None)

def get_user_by_username(username: str) -> Optional[User]:
    """Get user by username."""
    return next((u for u in mock_users if u.username == username), None)

def create_user(email: str, username: str) -> User:
    """Create a new user."""
    new_user = User(
        id=str(len(mock_users) + 1),
        username=username,
        email=email,
        highScore=0,
        gamesPlayed=0,
        createdAt=datetime.now()
    )
    mock_users.append(new_user)
    return new_user

def get_leaderboard(mode: Optional[GameMode] = None) -> list[LeaderboardEntry]:
    """Get leaderboard entries, optionally filtered by mode."""
    entries = mock_leaderboard.copy()
    if mode:
        entries = [e for e in entries if e.mode == mode]
    return entries[:10]

def submit_score(user: User, score: int, mode: GameMode) -> LeaderboardEntry:
    """Submit a score to the leaderboard."""
    entry = LeaderboardEntry(
        id=str(len(mock_leaderboard) + 1),
        username=user.username,
        score=score,
        mode=mode,
        date=datetime.now().strftime('%Y-%m-%d'),
        rank=0
    )
    mock_leaderboard.append(entry)
    
    # Sort and update ranks
    mock_leaderboard.sort(key=lambda e: e.score, reverse=True)
    for i, e in enumerate(mock_leaderboard):
        e.rank = i + 1
    
    # Update user high score
    if score > user.highScore:
        user.highScore = score
        user.gamesPlayed += 1
    
    return entry

def get_active_players() -> list[ActivePlayer]:
    """Get all active players."""
    # Update scores with some variation
    for player in mock_active_players:
        player.currentScore += random.randint(0, 10)
        player.gameState.score += random.randint(0, 10)
    return mock_active_players

def get_player_by_id(player_id: str) -> Optional[ActivePlayer]:
    """Get a specific active player by ID."""
    return next((p for p in mock_active_players if p.id == player_id), None)
