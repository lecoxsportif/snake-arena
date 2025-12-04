import pytest
from datetime import datetime
from app.models.sql import User, Score
from app.models.domain import GameMode

@pytest.fixture(autouse=True)
async def seed_db(db_session):
    """Seed database with initial data."""
    # Create users
    users = [
        User(
            id='1',
            username='PixelMaster',
            email='pixel@game.com',
            password='password123',
            high_score=1250,
            games_played=45,
            created_at=datetime(2024, 1, 15)
        ),
        User(
            id='2',
            username='NeonNinja',
            email='neon@game.com',
            password='password123',
            high_score=980,
            games_played=32,
            created_at=datetime(2024, 2, 20)
        ),
    ]
    db_session.add_all(users)
    
    # Create scores
    scores = [
        Score(user_id='1', username='PixelMaster', score=1250, mode=GameMode.WALLS.value, date=datetime(2024, 11, 25)),
        Score(user_id='2', username='NeonNinja', score=980, mode=GameMode.PASS_THROUGH.value, date=datetime(2024, 11, 24)),
    ]
    db_session.add_all(scores)
    await db_session.commit()

@pytest.mark.asyncio
class TestAuth:
    """Test authentication endpoints."""
    
    async def test_login_success(self, client):
        """Test successful login."""
        response = await client.post("/api/auth/login", json={
            "email": "pixel@game.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "PixelMaster"
        assert data["error"] is None
    
    async def test_login_invalid_email(self, client):
        """Test login with invalid email."""
        response = await client.post("/api/auth/login", json={
            "email": "invalid@email.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Invalid email or password"
        assert data["data"] is None
    
    async def test_signup_success(self, client):
        """Test successful signup."""
        response = await client.post("/api/auth/signup", json={
            "email": "newuser@test.com",
            "password": "password123",
            "username": "NewPlayer"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "NewPlayer"
        assert data["data"]["email"] == "newuser@test.com"
        assert data["data"]["highScore"] == 0
    
    async def test_signup_existing_email(self, client):
        """Test signup with existing email."""
        response = await client.post("/api/auth/signup", json={
            "email": "pixel@game.com",
            "password": "password123",
            "username": "DifferentUsername"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Email already exists"
    
    async def test_signup_existing_username(self, client):
        """Test signup with existing username."""
        response = await client.post("/api/auth/signup", json={
            "email": "different@email.com",
            "password": "password123",
            "username": "PixelMaster"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Username already taken"
    
    async def test_logout(self, client):
        """Test logout."""
        # Login first
        await client.post("/api/auth/login", json={
            "email": "pixel@game.com",
            "password": "password123"
        })
        
        # Logout
        response = await client.post("/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    async def test_get_current_user_not_authenticated(self, client):
        """Test getting current user when not authenticated."""
        response = await client.get("/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Not authenticated"
    
    async def test_get_current_user_authenticated(self, client):
        """Test getting current user when authenticated."""
        # Login first
        await client.post("/api/auth/login", json={
            "email": "pixel@game.com",
            "password": "password123"
        })
        
        # Get current user
        response = await client.get("/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "PixelMaster"


@pytest.mark.asyncio
class TestGame:
    """Test game endpoints."""
    
    async def test_get_leaderboard(self, client):
        """Test getting leaderboard."""
        response = await client.get("/api/game/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        assert len(data["data"]) <= 10
    
    async def test_get_leaderboard_filtered_by_mode(self, client):
        """Test getting leaderboard filtered by mode."""
        response = await client.get("/api/game/leaderboard?mode=walls")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert all(entry["mode"] == "walls" for entry in data["data"])
    
    async def test_submit_score_not_logged_in(self, client):
        """Test submitting score when not logged in."""
        response = await client.post("/api/game/score", json={
            "score": 100,
            "mode": "walls"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Must be logged in to submit score"
    
    async def test_submit_score_success(self, client):
        """Test successful score submission."""
        # Login first
        await client.post("/api/auth/login", json={
            "email": "pixel@game.com",
            "password": "password123"
        })
        
        # Submit score
        response = await client.post("/api/game/score", json={
            "score": 1500,
            "mode": "walls"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["score"] == 1500
        assert data["data"]["username"] == "PixelMaster"


@pytest.mark.asyncio
class TestLive:
    """Test live player endpoints."""
    
    async def test_get_active_players(self, client):
        """Test getting active players."""
        response = await client.get("/api/live/players")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        # Note: Active players are in-memory and might be empty if not seeded/mocked
        # But database.py initializes empty list.
        # We can't easily seed in-memory active_players from here without importing database module
        # and modifying it directly, which is fine for tests.
        
    async def test_get_player_stream_invalid(self, client):
        """Test getting player stream with invalid ID."""
        response = await client.get("/api/live/players/invalid-id")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Player not found"


@pytest.mark.asyncio
class TestRoot:
    """Test root endpoints."""
    
    async def test_root(self, client):
        """Test root endpoint."""
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    async def test_health(self, client):
        """Test health check endpoint."""
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
