# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Set API base URL to relative path for production (since served by same origin)
ENV VITE_API_BASE_URL=/api

# Build the application
RUN npm run build

# Stage 2: Build Backend
FROM python:3.12-slim-bookworm

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy dependency files
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies using uv
RUN uv sync --frozen --no-install-project --no-dev

# Copy application code
COPY backend/ .

# Copy built frontend assets to backend static directory
COPY --from=frontend-build /app/dist /app/app/static

# Install the project itself
RUN uv sync --frozen --no-dev

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

# Copy entrypoint script (ensure it's executable)
COPY backend/entrypoint.sh /executable-entrypoint.sh
RUN chmod +x /executable-entrypoint.sh

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/executable-entrypoint.sh"]
