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
  echo "[entrypoint] .env file found, updating for Docker environment..."
  
  # Update DB_HOST to use MySQL service name in Docker (only if not already mysql)
  if grep -q "^DB_HOST=" .env && ! grep -q "^DB_HOST=mysql" .env; then
    # Create backup comment
    if ! grep -q "# DB_HOST_BACKUP" .env; then
      sed -i.bak '1i# DB_HOST_BACKUP: Original value saved before Docker override' .env 2>/dev/null || true
    fi
    # Update DB_HOST
    sed -i.bak 's/^DB_HOST=.*/DB_HOST=mysql/' .env 2>/dev/null || \
    sed -i 's/^DB_HOST=.*/DB_HOST=mysql/' .env || \
    echo "DB_HOST=mysql" >> .env
  elif ! grep -q "^DB_HOST=" .env; then
    echo "DB_HOST=mysql" >> .env
  fi
  
  # Ensure DB_CONNECTION is mysql
  if grep -q "^DB_CONNECTION=" .env; then
    sed -i.bak 's/^DB_CONNECTION=.*/DB_CONNECTION=mysql/' .env 2>/dev/null || \
    sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=mysql/' .env || \
    echo "DB_CONNECTION=mysql" >> .env
  else
    echo "DB_CONNECTION=mysql" >> .env
  fi
  
  # Ensure DB_PORT is 3306
  if grep -q "^DB_PORT=" .env; then
    sed -i.bak 's/^DB_PORT=.*/DB_PORT=3306/' .env 2>/dev/null || \
    sed -i 's/^DB_PORT=.*/DB_PORT=3306/' .env || \
    echo "DB_PORT=3306" >> .env
  else
    echo "DB_PORT=3306" >> .env
  fi
  
  # Clean up backup files
  rm -f .env.bak 2>/dev/null || true
  
  if ! grep -q "^APP_KEY=base64" .env; then
    echo "[entrypoint] Generating APP_KEY..."
    php artisan key:generate --force
  fi
else
  echo "[entrypoint] No .env found; creating from environment variables..."
  # Create .env from environment variables if not exists
  cat > .env <<EOF
APP_NAME=${APP_NAME:-Tomoya}
APP_ENV=${APP_ENV:-local}
APP_KEY=
APP_DEBUG=${APP_DEBUG:-true}
APP_URL=${APP_URL:-http://localhost:8080}

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=${DB_DATABASE:-tomoya}
DB_USERNAME=${DB_USERNAME:-tomoya}
DB_PASSWORD=${DB_PASSWORD:-tomoya}

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
EOF
  php artisan key:generate --force
fi

# Wait for MySQL to be ready
echo "[entrypoint] Waiting for MySQL to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if php -r "
    try {
      \$pdo = new PDO('mysql:host=' . getenv('DB_HOST') . ';port=' . getenv('DB_PORT'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));
      \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
      echo 'connected';
      exit(0);
    } catch (Exception \$e) {
      exit(1);
    }
  " 2>/dev/null | grep -q "connected"; then
    echo "[entrypoint] MySQL is ready!"
    break
  fi
  attempt=$((attempt + 1))
  echo "[entrypoint] MySQL is unavailable - sleeping... (attempt $attempt/$max_attempts)"
  sleep 2
done

if [ $attempt -eq $max_attempts ]; then
  echo "[entrypoint] WARNING: Could not connect to MySQL after $max_attempts attempts"
  echo "[entrypoint] Continuing anyway - migrations will be skipped"
else
  # Run migrations (only if not already migrated)
  echo "[entrypoint] Checking database migrations..."
  php artisan migrate --force || echo "[entrypoint] Migration failed or already up to date"
fi

exec "$@"


