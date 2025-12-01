# Snake Arena

A multiplayer snake game with real-time leaderboards and live player streams.

## Quick Start

### Prerequisites

- **Frontend**: Node.js 18+ and npm
- **Backend**: Python 3.12+ and [uv](https://docs.astral.sh/uv/)

### Installation

```bash
# Install root dependencies (concurrently)
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && make dev && cd ..
```

### Running the Application

**Run both frontend and backend together:**

```bash
npm run dev
```

This will start:
- Frontend dev server at `http://localhost:5173`
- Backend API server at `http://localhost:3000/api`

**Run individually:**

```bash
# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend
```

### Running Tests

**Run all tests:**

```bash
npm test
```

**Run tests individually:**

```bash
npm run test:frontend
npm run test:backend
```

## Project Structure

```
snake-arena/
├── frontend/          # React + TypeScript frontend
├── backend/           # FastAPI backend
├── openapi.yaml       # API specification
└── AGENTS.md          # AI agent documentation
```

## Development

### Frontend

- Built with React, TypeScript, Vite, and shadcn/ui
- Game engine with configurable modes (walls/pass-through)
- Real-time leaderboards and player streams
- See [frontend/README.md](frontend/README.md) for details

### Backend

- Built with FastAPI and Python 3.12
- RESTful API with OpenAPI documentation
- In-memory database (mock implementation)
- See [backend/README.md](backend/README.md) for details

### API Documentation

When the backend is running, visit:
- Swagger UI: `http://localhost:3000/docs`
- ReDoc: `http://localhost:3000/redoc`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both frontend and backend |
| `npm run dev:frontend` | Run frontend only |
| `npm run dev:backend` | Run backend only |
| `npm test` | Run all tests |
| `npm run test:frontend` | Run frontend tests |
| `npm run test:backend` | Run backend tests |

## Environment Variables

### Frontend

Create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

### Backend

No environment variables required for development (uses defaults).

## License

MIT
