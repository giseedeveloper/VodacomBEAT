#!/bin/bash
# Build all React portals into deploy/dist/ (one at a time to save RAM).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
API_URL="${REACT_APP_API_URL:-https://165.22.124.111:8000}"

export REACT_APP_API_URL="$API_URL"
export NODE_ENV=production
export CI=false
export DISABLE_ESLINT_PLUGIN=true

DIST="$ROOT/deploy/dist"
rm -rf "$DIST"
mkdir -p "$DIST"

build_portal() {
  local portal_dir="$1"
  local output_name="$2"

  echo ""
  echo "=========================================="
  echo " Building: $output_name"
  echo " Portal:   portals/$portal_dir"
  echo " API URL:  $REACT_APP_API_URL"
  echo "=========================================="

  cd "$ROOT/portals/$portal_dir"
  corepack enable 2>/dev/null || true
  yarn install --network-timeout 600000
  yarn build

  mkdir -p "$DIST/$output_name"
  cp -r build/. "$DIST/$output_name/"
  rm -rf build

  echo "Done: $output_name ($(du -sh "$DIST/$output_name" | cut -f1))"
}

# Lightest first, admin last (heaviest).
build_portal "referrals-agents-portal" "referrals"
build_portal "vodacom-agents-portal" "agents"
build_portal "customer" "customer"
build_portal "admin-portal" "admin"

echo ""
echo "All portals built -> deploy/dist/"
du -sh "$DIST"/*
