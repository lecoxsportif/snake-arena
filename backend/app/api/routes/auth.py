"""Authentication routes."""

from typing import Optional
from fastapi import APIRouter, Depends, Response, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.schemas import AuthCredentials, ApiResponse
from app.utils.security import verify_password
from app.services import database as db
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(
    credentials: AuthCredentials, 
    response: Response,
    db_session: AsyncSession = Depends(get_db)
) -> ApiResponse:
    """Login user with email and password."""
    user = await db.get_user_by_email(db_session, credentials.email)
    
    if not user:
        return ApiResponse(
            success=False,
            error="Invalid email or password",
            data=None
        )
    
    # Validate password (in production, use proper password hashing)
    # Verify password using hashed value
    if not verify_password(credentials.password, user.password):
        return ApiResponse(
            success=False,
            error="Invalid email or password",
            data=None
        )
    
    # Create session
    token = await db.create_session(user.id)
    
    # Set cookie
    response.set_cookie(
        key="snake_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False  # Set to True in production with HTTPS
    )
    
    return ApiResponse(
        success=True,
        error=None,
        data=user.model_dump(exclude={'password'}, by_alias=True)
    )

@router.post("/signup")
async def signup(
    credentials: AuthCredentials,
    response: Response,
    db_session: AsyncSession = Depends(get_db)
) -> ApiResponse:
    """Register a new user."""
    # Check if email already exists
    if await db.get_user_by_email(db_session, credentials.email):
        return ApiResponse(
            success=False,
            error="Email already exists",
            data=None
        )
    
    # Check if username already exists
    if credentials.username and await db.get_user_by_username(db_session, credentials.username):
        return ApiResponse(
            success=False,
            error="Username already taken",
            data=None
        )
    
    # Create new user
    # Generate default username if not provided
    username = credentials.username or credentials.email.split('@')[0]
    
    new_user = await db.create_user(db_session, credentials.email, username, credentials.password)
    
    # Create session
    token = await db.create_session(new_user.id)
    
    # Set cookie
    response.set_cookie(
        key="snake_session",
        value=token,
        httponly=True,
        samesite="lax",
        secure=False
    )
    
    return ApiResponse(
        success=True,
        error=None,
        data=new_user.model_dump(exclude={'password'}, by_alias=True)
    )

@router.post("/logout")
async def logout(
    response: Response,
    snake_session: Optional[str] = Cookie(None)
) -> ApiResponse:
    """Logout current user."""
    if snake_session:
        await db.delete_session(snake_session)
        
    response.delete_cookie("snake_session")
    
    return ApiResponse(
        success=True,
        error=None,
        data=None
    )

@router.get("/me")
async def get_current_user(
    db_session: AsyncSession = Depends(get_db),
    snake_session: Optional[str] = Cookie(None)
) -> ApiResponse:
    """Get current authenticated user."""
    if not snake_session:
        return ApiResponse(
            success=False,
            error="Not authenticated",
            data=None
        )
        
    user = await db.get_user_by_session_token(db_session, snake_session)
    
    if not user:
        return ApiResponse(
            success=False,
            error="Not authenticated",
            data=None
        )
    
    return ApiResponse(
        success=True,
        error=None,
        data=user.model_dump(exclude={'password'}, by_alias=True)
    )
