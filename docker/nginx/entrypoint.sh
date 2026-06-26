#!/bin/sh
set -e

mkdir -p /etc/nginx/ssl

IP="${SERVER_IP:-165.22.124.111}"

if [ ! -f /etc/nginx/ssl/cert.pem ]; then
  openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/CN=${IP}" \
    -addext "subjectAltName=IP:${IP}"
fi
