"""Authentication routes."""

from fastapi import APIRouter
from app.models.schemas import AuthCredentials, ApiResponse
from app.services import database as db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(credentials: AuthCredentials) -> ApiResponse:
    """Login user with email and password."""
    user = db.get_user_by_email(credentials.email)
    
    if not user:
        return ApiResponse(
            success=False,
            error="Invalid email or password",
            data=None
        )
    
    # In a real app, we'd verify the password here
    db.current_user = user
    
    return ApiResponse(
        success=True,
        error=None,
        data=user.model_dump()
    )

@router.post("/signup")
async def signup(credentials: AuthCredentials) -> ApiResponse:
    """Register a new user."""
    # Check if email already exists
    if db.get_user_by_email(credentials.email):
        return ApiResponse(
            success=False,
            error="Email already exists",
            data=None
        )
    
    # Check if username already exists
    if credentials.username and db.get_user_by_username(credentials.username):
        return ApiResponse(
            success=False,
            error="Username already taken",
            data=None
        )
    
    # Create new user
    username = credentials.username or f"Player{len(db.mock_users)}"
    new_user = db.create_user(credentials.email, username)
    db.current_user = new_user
    
    return ApiResponse(
        success=True,
        error=None,
        data=new_user.model_dump()
    )

@router.post("/logout")
async def logout() -> ApiResponse:
    """Logout current user."""
    db.current_user = None
    
    return ApiResponse(
        success=True,
        error=None,
        data=None
    )

@router.get("/me")
async def get_current_user() -> ApiResponse:
    """Get current authenticated user."""
    if not db.current_user:
        return ApiResponse(
            success=False,
            error="Not authenticated",
            data=None
        )
    
    return ApiResponse(
        success=True,
        error=None,
        data=db.current_user.model_dump()
    )
