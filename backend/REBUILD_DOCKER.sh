#!/bin/bash

echo "Rebuilding Docker containers with MySQL support..."
echo

cd "$(dirname "$0")"

echo "Stopping containers..."
docker-compose down

echo
echo "Rebuilding app container (this may take a few minutes)..."
docker-compose build --no-cache app

echo
echo "Starting containers..."
docker-compose up -d

echo
echo "Waiting for MySQL to be ready..."
sleep 10

echo
echo "Verifying MySQL extensions..."
docker-compose exec app php -m | grep -i mysql

echo
echo "Running migrations..."
docker-compose exec app php artisan migrate:fresh --seed

echo
echo "Done! Check the output above for any errors."

