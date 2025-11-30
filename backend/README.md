# Snake Arena Backend

FastAPI backend for the Snake Arena game.

## Setup

This project uses `uv` for dependency management.

### Install Dependencies

```bash
uv sync
```

## Running the Server

Start the development server:

```bash
uv run uvicorn app.main:app --reload --port 3000
```

The server will be available at:
- API: `http://localhost:3000/api`
- Swagger UI: `http://localhost:3000/docs`
- ReDoc: `http://localhost:3000/redoc`

## Running Tests

Run all tests:

```bash
uv run pytest
```

Run tests with verbose output:

```bash
uv run pytest -v
```

## Project Structure

```
app/
├── api/                 # API layer
│   ├── dependencies.py  # Shared dependencies
│   └── routes/          # API route handlers
├── core/                # Core configuration
│   └── config.py        # App settings
├── models/              # Data models
│   ├── domain.py        # Domain models
│   └── schemas.py       # API schemas
└── services/            # Business logic
    ├── database.py      # Database operations
    └── game.py          # Game logic
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Game
- `POST /api/game/score` - Submit score
- `GET /api/game/leaderboard` - Get leaderboard

### Live Players
- `GET /api/live/players` - Get active players
- `GET /api/live/players/{id}` - Get player stream
