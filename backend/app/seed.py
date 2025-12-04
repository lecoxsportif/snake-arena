"""Database seeding script."""

import asyncio
from datetime import datetime
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.sql import User, Score
from app.models.domain import GameMode

async def seed_data():
    """Seed database with initial data."""
    async with AsyncSessionLocal() as session:
        # Check if data exists
        result = await session.execute(select(User))
        if result.first():
            print("Database already seeded.")
            return

        print("Seeding database...")
        
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
            User(
                id='3',
                username='RetroGamer',
                email='retro@game.com',
                password='password123',
                high_score=850,
                games_played=28,
                created_at=datetime(2024, 3, 10)
            ),
        ]
        
        session.add_all(users)
        
        # Create scores
        scores = [
            Score(user_id='1', username='PixelMaster', score=1250, mode=GameMode.WALLS.value, date=datetime(2024, 11, 25)),
            Score(user_id='2', username='NeonNinja', score=980, mode=GameMode.PASS_THROUGH.value, date=datetime(2024, 11, 24)),
            Score(user_id='3', username='RetroGamer', score=850, mode=GameMode.WALLS.value, date=datetime(2024, 11, 23)),
        ]
        
        session.add_all(scores)
        
        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_data())
