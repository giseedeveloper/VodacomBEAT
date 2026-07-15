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
if [ -n "${QUEUE_CONNECTION:-}" ]; then
    sed -i "s/^QUEUE_CONNECTION=.*/QUEUE_CONNECTION=${QUEUE_CONNECTION}/" .env
fi
if [ -n "${REDIS_HOST:-}" ]; then
    sed -i "s/^REDIS_HOST=.*/REDIS_HOST=${REDIS_HOST}/" .env
fi
if [ -n "${BEAT_AI_WORKER_URL:-}" ]; then
    if grep -q '^BEAT_AI_WORKER_URL=' .env 2>/dev/null; then
        sed -i "s|^BEAT_AI_WORKER_URL=.*|BEAT_AI_WORKER_URL=${BEAT_AI_WORKER_URL}|" .env
    else
        echo "BEAT_AI_WORKER_URL=${BEAT_AI_WORKER_URL}" >> .env
    fi
fi

# Keep .env.production in sync when APP_ENV=production (Laravel prefers it)
if [ "${APP_ENV:-}" = "production" ] && [ -f .env.production ]; then
    for key in DB_HOST DB_PASSWORD APP_URL APP_ENV APP_DEBUG QUEUE_CONNECTION REDIS_HOST BEAT_AI_WORKER_URL BEAT_AI_WORKER_TOKEN BEAT_LLM_API_KEY; do
        eval "val=\${$key:-}"
        if [ -n "$val" ]; then
            if grep -q "^${key}=" .env.production 2>/dev/null; then
                sed -i "s|^${key}=.*|${key}=${val}|" .env.production
            else
                echo "${key}=${val}" >> .env.production
            fi
        fi
    done
fi

echo "Waiting for database..."
until php -r "new PDO('mysql:host=${DB_HOST:-mysql};port=${DB_PORT:-3306}', '${DB_USERNAME:-root}', '${DB_PASSWORD:-secret}');" 2>/dev/null; do
    sleep 2
done

php artisan config:clear --no-interaction
php artisan migrate --force --no-interaction
php artisan db:seed --force --no-interaction || true

# Honor container command (e.g. queue:work); default to built-in PHP server
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

exec php -S 0.0.0.0:8000 -t public public/index.php
