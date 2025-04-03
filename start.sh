#!/bin/bash
# Start script for Render

# Print message (no sensitive information)
echo "Starting application deployment process..."

# Check if we're using the remote database 
echo "Testing database connection..."
if PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1" > /dev/null 2>&1; then
  echo "Database connection successful!"
else
  echo "WARNING: Cannot connect to the database. Please check your database credentials."
  echo "Deployment will continue but may fail if database connection is not established."
fi

# Check if session table exists, create if it doesn't
echo "Checking for session table..."
if ! PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1 FROM session LIMIT 1" > /dev/null 2>&1; then
  echo "Creating session table..."
  PGPASSWORD=$PGPASSWORD psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "
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

# Build the application for production
echo "Building application..."
npm run build

# Start the application in production mode
echo "Starting application..."
# Check which path exists and use the appropriate one
if [ -f "dist/server/index.js" ]; then
  NODE_ENV=production node dist/server/index.js
elif [ -f "dist/index.js" ]; then
  NODE_ENV=production node dist/index.js
else
  echo "ERROR: Could not find server file in dist directory!"
  exit 1
fi