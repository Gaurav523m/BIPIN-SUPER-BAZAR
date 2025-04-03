#!/bin/bash
# Start script for Render

# Print message (no sensitive information)
echo "Starting application deployment process..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1" > /dev/null 2>&1; then
    echo "PostgreSQL is ready!"
    break
  fi
  echo "Waiting for PostgreSQL... ($i/30)"
  sleep 2
done

# Initialize the database if needed (with error handling)
echo "Initializing database schema..."
psql $DATABASE_URL -f migrations/combined.sql || echo "Warning: Database initialization completed with warnings, continuing..."

echo "Loading seed data..."
psql $DATABASE_URL -f migrations/seed_data.sql || echo "Warning: Seed data loading completed with warnings, continuing..."

# Build the application for production
echo "Building application..."
npm run build

# Start the application in production mode
echo "Starting application..."
npm run start