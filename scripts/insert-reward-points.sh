#!/bin/bash

# Script to insert reward points into database
# Reads database connection info from .env.development file

# Load environment variables
if [ -f .env.development ]; then
    set -a
    source .env.development
    set +a
elif [ -f .env ]; then
    set -a
    source .env
    set +a
else 
    echo 'Error: .env.development or .env file not found'
    exit 1
fi

# Check if required environment variables are set
if [ -z "$DATABASE_HOST" ] || [ -z "$DATABASE_PORT" ] || [ -z "$DATABASE_USER" ] || [ -z "$DATABASE_PASSWORD" ] || [ -z "$DATABASE_NAME" ]; then
    echo 'Error: Required database environment variables are not set'
    echo 'Required: DATABASE_HOST, DATABASE_PORT, DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME'
    exit 1
fi

# Get schema from env or default to 'development'
SCHEMA=${DATABASE_SCHEMA:-development}

echo "Connecting to database: $DATABASE_HOST:$DATABASE_PORT/$DATABASE_NAME"
echo "Using schema: $SCHEMA"
echo ""

# Create temporary SQL file with schema replacement
TEMP_SQL=$(mktemp)
sed "s/development\.reward_points/$SCHEMA.reward_points/g" db/insert-reward-points.sql > "$TEMP_SQL"

# Execute SQL script
echo "Inserting reward points..."
PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -d $DATABASE_NAME -f "$TEMP_SQL"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Reward points inserted successfully!"
else
    echo ""
    echo "❌ Error inserting reward points."
    rm -f "$TEMP_SQL"
    exit 1
fi

# Clean up
rm -f "$TEMP_SQL"

