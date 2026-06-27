#!/bin/bash
# Obtain Let's Encrypt certificates for BizTune subdomains (run on VPS as root).
set -euo pipefail

DOMAINS=(
    admin.biztune.co.tz
    agent.biztune.co.tz
    referrals.biztune.co.tz
)

EMAIL="${SSL_EMAIL:-admin@biztune.co.tz}"
WEBROOT="/var/www/certbot"
PROJECT="/var/www/vodacom-caller-tunes"

mkdir -p "${WEBROOT}"

if ! command -v certbot >/dev/null 2>&1; then
    apt-get update -qq
    apt-get install -y certbot
fi

DOMAIN_ARGS=""
for d in "${DOMAINS[@]}"; do
    DOMAIN_ARGS="${DOMAIN_ARGS} -d ${d}"
done

certbot certonly --webroot -w "${WEBROOT}" \
    ${DOMAIN_ARGS} \
    --email "${EMAIL}" \
    --agree-tos \
    --non-interactive \
    --keep-until-expiring

cd "${PROJECT}"
docker compose -f docker-compose.prod.fast.yml --env-file .env.production up -d web --force-recreate

echo ""
echo "SSL installed. Subdomains:"
echo "  https://admin.biztune.co.tz"
echo "  https://agent.biztune.co.tz"
echo "  https://referrals.biztune.co.tz"
