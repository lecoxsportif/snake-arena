import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services import database as db

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    """Reset database state before each test."""
    db.current_user = None
    yield

class TestAuth:
    """Test authentication endpoints."""
    
    def test_login_success(self):
        """Test successful login."""
        response = client.post("/api/auth/login", json={
            "email": "pixel@game.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "PixelMaster"
        assert data["error"] is None
    
    def test_login_invalid_email(self):
        """Test login with invalid email."""
        response = client.post("/api/auth/login", json={
            "email": "invalid@email.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Invalid email or password"
        assert data["data"] is None
    
    def test_signup_success(self):
        """Test successful signup."""
        response = client.post("/api/auth/signup", json={
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
    
    def test_signup_existing_email(self):
        """Test signup with existing email."""
        response = client.post("/api/auth/signup", json={
            "email": "pixel@game.com",
            "password": "password123",
            "username": "DifferentUsername"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Email already exists"
    
    def test_signup_existing_username(self):
        """Test signup with existing username."""
        response = client.post("/api/auth/signup", json={
            "email": "different@email.com",
            "password": "password123",
            "username": "PixelMaster"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Username already taken"
    
    def test_logout(self):
        """Test logout."""
        # Login first
        client.post("/api/auth/login", json={
            "email": "pixel@game.com",
            "password": "password123"
        })
        
        # Logout
        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
    
    def test_get_current_user_not_authenticated(self):
        """Test getting current user when not authenticated."""
        response = client.get("/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Not authenticated"
    
    def test_get_current_user_authenticated(self):
        """Test getting current user when authenticated."""
        # Login first
        client.post("/api/auth/login", json={
            "email": "pixel@game.com",
            "password": "password123"
        })
        
        # Get current user
        response = client.get("/api/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["username"] == "PixelMaster"


class TestGame:
    """Test game endpoints."""
    
    def test_get_leaderboard(self):
        """Test getting leaderboard."""
        response = client.get("/api/game/leaderboard")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        assert len(data["data"]) <= 10
    
    def test_get_leaderboard_filtered_by_mode(self):
        """Test getting leaderboard filtered by mode."""
        response = client.get("/api/game/leaderboard?mode=walls")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert all(entry["mode"] == "walls" for entry in data["data"])
    
    def test_submit_score_not_logged_in(self):
        """Test submitting score when not logged in."""
        response = client.post("/api/game/score", json={
            "score": 100,
            "mode": "walls"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Must be logged in to submit score"
    
    def test_submit_score_success(self):
        """Test successful score submission."""
        # Login first
        client.post("/api/auth/login", json={
            "email": "pixel@game.com",
            "password": "password123"
        })
        
        # Submit score
        response = client.post("/api/game/score", json={
            "score": 1500,
            "mode": "walls"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["score"] == 1500
        assert data["data"]["username"] == "PixelMaster"


class TestLive:
    """Test live player endpoints."""
    
    def test_get_active_players(self):
        """Test getting active players."""
        response = client.get("/api/live/players")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)
        assert len(data["data"]) > 0
        
        # Check player structure
        player = data["data"][0]
        assert "id" in player
        assert "username" in player
        assert "gameState" in player
    
    def test_get_player_stream_valid(self):
        """Test getting specific player stream."""
        # First get active players to get a valid ID
        players_response = client.get("/api/live/players")
        player_id = players_response.json()["data"][0]["id"]
        
        # Get specific player
        response = client.get(f"/api/live/players/{player_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == player_id
    
    def test_get_player_stream_invalid(self):
        """Test getting player stream with invalid ID."""
        response = client.get("/api/live/players/invalid-id")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["error"] == "Player not found"


class TestRoot:
    """Test root endpoints."""
    
    def test_root(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
    
    def test_health(self):
        """Test health check endpoint."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
