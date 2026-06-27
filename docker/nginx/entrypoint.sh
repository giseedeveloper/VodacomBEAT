#!/bin/sh
set -e

mkdir -p /etc/nginx/ssl /var/www/certbot

DOMAINS="admin.biztune.co.tz agent.biztune.co.tz referrals.biztune.co.tz"
IP="${SERVER_IP:-165.22.124.111}"

# Prefer Let's Encrypt certificate when available
LE_DIR=""
for candidate in /etc/letsencrypt/live/admin.biztune.co.tz /etc/letsencrypt/live/biztune.co.tz; do
    if [ -f "${candidate}/fullchain.pem" ] && [ -f "${candidate}/privkey.pem" ]; then
        LE_DIR="${candidate}"
        break
    fi
done

if [ -n "${LE_DIR}" ]; then
    cp "${LE_DIR}/fullchain.pem" /etc/nginx/ssl/cert.pem
    cp "${LE_DIR}/privkey.pem" /etc/nginx/ssl/key.pem
elif [ ! -f /etc/nginx/ssl/cert.pem ]; then
    SAN="IP:${IP}"
    for domain in ${DOMAINS}; do
        SAN="${SAN},DNS:${domain}"
    done
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
        -keyout /etc/nginx/ssl/key.pem \
        -out /etc/nginx/ssl/cert.pem \
        -subj "/CN=admin.biztune.co.tz" \
        -addext "subjectAltName=${SAN}"
fi
