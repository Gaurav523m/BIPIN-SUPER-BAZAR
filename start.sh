#!/bin/bash
# Start script for Render

# Initialize the database if needed
psql $DATABASE_URL -f migrations/combined.sql
psql $DATABASE_URL -f migrations/seed_data.sql

# Start the application
npm run dev