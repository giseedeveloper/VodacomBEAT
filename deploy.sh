#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env.production ]; then
  cp .env.production.example .env.production
fi

set -a
source .env.production
set +a

docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

echo ""
echo "Vodacom Caller Tunes is running:"
echo "  Customer:  https://${SERVER_IP}:443"
echo "  Admin:     https://${SERVER_IP}:3332/login"
echo "  Agents:    https://${SERVER_IP}:3001/login"
echo "  Referrals: https://${SERVER_IP}:3002/login"
echo "  API:       https://${SERVER_IP}:8000"
echo ""
echo "Demo login password: Demo@12345"
echo "  Admin: admin@demo.com"
echo "  Agents: 0711111111"
echo "  Referrals: 0722222222"
