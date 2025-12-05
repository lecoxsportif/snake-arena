"""Integration test configuration."""

import pytest
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.database import Base, get_db
from app.main import app
from httpx import AsyncClient, ASGITransport

# Use file-based SQLite for integration tests to verify persistence
TEST_DB_FILE = "test_integration.db"
TEST_DATABASE_URL = f"sqlite+aiosqlite:///./{TEST_DB_FILE}"

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def db_engine():
    """Create async engine for the session."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    yield engine
    
    # Cleanup
    await engine.dispose()
    if os.path.exists(TEST_DB_FILE):
        os.remove(TEST_DB_FILE)

@pytest.fixture(scope="function")
async def db_session(db_engine):
    """Create a new database session for a test."""
    TestingSessionLocal = async_sessionmaker(
        autocommit=False, 
        autoflush=False, 
        bind=db_engine, 
        class_=AsyncSession
    )
    
    async with TestingSessionLocal() as session:
        yield session
        # No rollback here to simulate real persistence if needed, 
        # but for isolation we might want to truncate tables or use transaction rollback.
        # For integration tests checking persistence across requests, we keep data.
        # But to avoid pollution, we can truncate tables between tests if needed.
        # For now, let's truncate tables after each test function to ensure clean state.
        
        # Truncate tables
        async with db_engine.begin() as conn:
            # SQLite doesn't support TRUNCATE, use DELETE
            await conn.execute(Base.metadata.tables["scores"].delete())
            await conn.execute(Base.metadata.tables["users"].delete())

@pytest.fixture(scope="function")
def override_get_db(db_session):
    async def _override_get_db():
        yield db_session
    return _override_get_db

@pytest.fixture(autouse=True)
def apply_override(override_get_db):
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.fixture(scope="function")
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
