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
sed -i 's/^# DB_PASSWORD=.*/DB_PASSWORD=secret/' .env
sed -i 's/^DB_PASSWORD=.*/DB_PASSWORD=secret/' .env

if [ -z "$(grep '^APP_KEY=base64:' .env 2>/dev/null || true)" ]; then
    php artisan key:generate --force --no-interaction
fi

composer install --no-interaction --ignore-platform-reqs

echo "Waiting for database..."
until php -r "new PDO('mysql:host=${DB_HOST:-mysql};port=${DB_PORT:-3306}', '${DB_USERNAME:-root}', '${DB_PASSWORD:-secret}');" 2>/dev/null; do
    sleep 2
done

php artisan config:clear --no-interaction
php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction

exec php artisan serve --host=0.0.0.0 --port=8000
