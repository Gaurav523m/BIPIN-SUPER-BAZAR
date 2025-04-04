#!/bin/bash
# Start script for Render

# Print message (no sensitive information)
echo "Starting application deployment process..."

# Check if we're using the remote database
echo "Testing database connection..."
# Check if DATABASE_URL is set, use it directly
if [ -n "$DATABASE_URL" ]; then
  if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo "Database connection successful using DATABASE_URL!"
  else
    echo "WARNING: Cannot connect to the database using DATABASE_URL."
    echo "Deployment will continue but may fail if database connection is not established."
  fi
else
  # Ensure PGPORT is a number
  if ! [[ "$PGPORT" =~ ^[0-9]+$ ]]; then
    echo "Warning: PGPORT is not a valid number. Setting to default 5432."
    export PGPORT=5432
  fi
  
  if PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -p $PGPORT -c "SELECT 1" > /dev/null 2>&1; then
    echo "Database connection successful using individual parameters!"
  else
    echo "WARNING: Cannot connect to the database. Please check your database credentials."
    echo "Deployment will continue but may fail if database connection is not established."
  fi
fi

# Check if session table exists, create if it doesn't
echo "Checking for session table..."
if [ -n "$DATABASE_URL" ]; then
  if ! psql "$DATABASE_URL" -c "SELECT 1 FROM session LIMIT 1" > /dev/null 2>&1; then
    echo "Creating session table using DATABASE_URL..."
    psql "$DATABASE_URL" -c "
    CREATE TABLE IF NOT EXISTS \"session\" (
      \"sid\" varchar NOT NULL COLLATE \"default\",
      \"sess\" json NOT NULL,
      \"expire\" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);
    
    ALTER TABLE \"session\" ADD CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\") NOT DEFERRABLE INITIALLY IMMEDIATE;
    
    CREATE INDEX IF NOT EXISTS \"IDX_session_expire\" ON \"session\" (\"expire\");
    " || echo "Warning: Session table creation had warnings, but continuing..."
  fi
else
  if ! PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -p $PGPORT -c "SELECT 1 FROM session LIMIT 1" > /dev/null 2>&1; then
    echo "Creating session table using individual parameters..."
    PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -p $PGPORT -c "
    CREATE TABLE IF NOT EXISTS \"session\" (
      \"sid\" varchar NOT NULL COLLATE \"default\",
      \"sess\" json NOT NULL,
      \"expire\" timestamp(6) NOT NULL
    )
    WITH (OIDS=FALSE);
    
    ALTER TABLE \"session\" ADD CONSTRAINT \"session_pkey\" PRIMARY KEY (\"sid\") NOT DEFERRABLE INITIALLY IMMEDIATE;
    
    CREATE INDEX IF NOT EXISTS \"IDX_session_expire\" ON \"session\" (\"expire\");
    " || echo "Warning: Session table creation had warnings, but continuing..."
  fi
fi

# Build the application for production
echo "Building application..."
# Run custom build instead of npm run build
echo "Building client with Vite..."
npx vite build

echo "Building server with ESBuild..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist/server

# Start the application in production mode
echo "Starting application..."
# Check which path exists and use the appropriate one
if [ -f "dist/server/index.js" ]; then
  echo "Found server file at dist/server/index.js"
  NODE_ENV=production node dist/server/index.js
elif [ -f "dist/index.js" ]; then
  echo "Found server file at dist/index.js"
  NODE_ENV=production node dist/index.js
else
  echo "ERROR: Could not find server file in dist directory!"
  ls -la dist/
  ls -la dist/server/ || echo "dist/server directory does not exist"
  exit 1
fi
