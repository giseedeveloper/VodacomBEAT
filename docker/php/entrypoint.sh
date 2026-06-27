#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

# Mounted host .env may point to SQLite — force MySQL inside Docker
sed -i 's/^DB_CONNECTION=.*/DB_CONNECTION=mysql/' .env
sed -i 's/^# DB_HOST=.*/DB_HOST=mysql/' .env
sed -i 's/^DB_HOST=.*/DB_HOST=mysql/' .env
sed -i 's/^# DB_PORT=.*/DB_PORT=3306/' .env
sed -i 's/^DB_PORT=.*/DB_PORT=3306/' .env
sed -i 's|^DB_DATABASE=.*|DB_DATABASE=vodacom-caller-tunes|' .env
sed -i 's/^# DB_USERNAME=.*/DB_USERNAME=root/' .env
sed -i 's/^DB_USERNAME=.*/DB_USERNAME=root/' .env
sed -i 's/^# DB_PASSWORD=.*/DB_PASSWORD='"${DB_PASSWORD:-secret}"'/' .env
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD='"${DB_PASSWORD:-secret}"'/' .env

composer install --no-interaction --ignore-platform-reqs --no-dev --optimize-autoloader

if [ -z "$(grep '^APP_KEY=base64:' .env 2>/dev/null || true)" ]; then
    php artisan key:generate --force --no-interaction
fi

# Ensure Docker env overrides mounted .env
if [ -n "${DB_HOST:-}" ]; then
    sed -i "s/^DB_HOST=.*/DB_HOST=${DB_HOST}/" .env
fi
if [ -n "${DB_PASSWORD:-}" ]; then
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=${DB_PASSWORD}/" .env
fi
if [ -n "${APP_URL:-}" ]; then
    sed -i "s|^APP_URL=.*|APP_URL=${APP_URL}|" .env
fi
if [ -n "${APP_ENV:-}" ]; then
    sed -i "s/^APP_ENV=.*/APP_ENV=${APP_ENV}/" .env
fi
if [ -n "${APP_DEBUG:-}" ]; then
    sed -i "s/^APP_DEBUG=.*/APP_DEBUG=${APP_DEBUG}/" .env
fi

echo "Waiting for database..."
until php -r "new PDO('mysql:host=${DB_HOST:-mysql};port=${DB_PORT:-3306}', '${DB_USERNAME:-root}', '${DB_PASSWORD:-secret}');" 2>/dev/null; do
    sleep 2
done

php artisan config:clear --no-interaction
php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction || true

exec php -S 0.0.0.0:8000 -t public public/index.php
