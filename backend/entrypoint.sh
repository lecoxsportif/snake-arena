#!/bin/bash
set -e

# Run migrations
# Run database migrations with retry logic
MAX_RETRIES=30
COUNTER=0

echo "Running database migrations..."
until alembic upgrade head; do
  COUNTER=$((COUNTER + 1))
  if [ $COUNTER -ge $MAX_RETRIES ]; then
    echo "Error: Could not migrate database after $MAX_RETRIES attempts."
    exit 1
  fi
  echo "Migration failed, retrying in 2 seconds... ($COUNTER/$MAX_RETRIES)"
  sleep 2
done


# Start server
echo "Starting server on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
