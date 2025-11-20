#!/bin/bash

if [ -f .env.development ]; then
    set -a
    source .env.development
    set +a
else 
    echo '.env.development file not found'
    exit 1
fi

# Use simple echo instead of read -p with prompt
echo -n "Enter the name of the new database (will be prefixed with clone_): "
read DATABASE_NAME_TEST

DATABASE_NAME_TEST="clone_$DATABASE_NAME_TEST"

if [ -z "$DATABASE_NAME_TEST" ]; then
    echo "Database name is required"
    exit 1
fi

# Core

echo "1. Dumping database from production..."
PGPASSWORD=$DATABASE_PASSWORD pg_dump -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -d $DATABASE_NAME -Fc -f production.sql

if [ $? -ne 0 ]; then
    echo "Error dumping database."
    exit 1
fi

echo "2. Creating new database..."
PGPASSWORD=$DATABASE_PASSWORD psql -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -d $DATABASE_NAME -c "CREATE DATABASE $DATABASE_NAME_TEST"

if [ $? -ne 0 ]; then
    echo "Error creating new database."
    exit 1
fi

echo "3. Restoring database to new database..."
PGPASSWORD=$DATABASE_PASSWORD pg_restore -h $DATABASE_HOST -p $DATABASE_PORT -U $DATABASE_USER -d $DATABASE_NAME_TEST production.sql

if [ $? -ne 0 ]; then
    echo "Error restoring database."
    exit 1
fi

echo "4. Cleaning up..."
rm -f production.sql

echo "Database cloned successfully to $DATABASE_NAME_TEST"