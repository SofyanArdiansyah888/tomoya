#!/usr/bin/env sh
set -e

cd /var/www/html

# Ensure storage and cache are writable
mkdir -p storage bootstrap/cache
chmod -R 775 storage bootstrap/cache || true
chown -R www-data:www-data storage bootstrap/cache || true

# Install dependencies if vendor is missing or empty
if [ ! -d "vendor" ] || [ -z "$(ls -A vendor 2>/dev/null)" ]; then
  echo "[entrypoint] Installing PHP dependencies..."
  composer install --no-interaction --prefer-dist --no-progress
fi

# Generate APP_KEY if not set
if [ -f .env ]; then
  if ! grep -q "^APP_KEY=base64" .env; then
    echo "[entrypoint] Generating APP_KEY..."
    php artisan key:generate --force
  fi
else
  echo "[entrypoint] No .env found; copying .env.example -> .env"
  if [ -f .env.example ]; then
    cp .env.example .env
    php artisan key:generate --force
  fi
fi

exec "$@"


