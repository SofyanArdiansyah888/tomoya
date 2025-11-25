@echo off
echo Rebuilding Docker containers with MySQL support...
echo.

cd /d %~dp0

echo Stopping containers...
docker-compose down

echo.
echo Rebuilding app container (this may take a few minutes)...
docker-compose build --no-cache app

echo.
echo Starting containers...
docker-compose up -d

echo.
echo Waiting for MySQL to be ready...
timeout /t 10 /nobreak >nul

echo.
echo Verifying MySQL extensions...
docker-compose exec app php -m | findstr /i "mysql"

echo.
echo Running migrations...
docker-compose exec app php artisan migrate:fresh --seed

echo.
echo Done! Check the output above for any errors.
pause

