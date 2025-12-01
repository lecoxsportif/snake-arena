.PHONY: help install dev test clean run lint format

# Default target
help:
	@echo "Snake Arena Backend - Available Commands"
	@echo "========================================"
	@echo "make install    - Install dependencies"
	@echo "make dev        - Install dev dependencies"
	@echo "make run        - Start development server"
	@echo "make test       - Run tests"
	@echo "make test-v     - Run tests with verbose output"
	@echo "make test-cov   - Run tests with coverage report"
	@echo "make lint       - Run linting checks"
	@echo "make format     - Format code"
	@echo "make clean      - Clean cache and temporary files"

# Install production dependencies
install:
	uv sync --no-dev

# Install all dependencies including dev
dev:
	uv sync

# Run development server
run:
	uv run uvicorn app.main:app --reload --port 3000

# Run tests
test:
	uv run pytest

# Run tests with verbose output
test-v:
	uv run pytest -v

# Run tests with coverage
test-cov:
	uv run pytest --cov=app --cov-report=term-missing

# Lint code (if ruff is added)
lint:
	@echo "Linting not configured yet. Add ruff to dev dependencies."

# Format code (if ruff is added)
format:
	@echo "Formatting not configured yet. Add ruff to dev dependencies."

# Clean cache and temporary files
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
