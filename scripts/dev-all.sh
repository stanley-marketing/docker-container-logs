#!/usr/bin/env bash
# 🏃 dev-all.sh – one-liner to start API + dashboard in dev mode
# Usage: ./scripts/dev-all.sh  (ensure npm i ran in root and website first)

set -e

# Default env vars (override by exporting before running)
export JWT_SECRET="${JWT_SECRET:-changeme}"
export ADMIN_USER="${ADMIN_USER:-admin}"
export ADMIN_PASS="${ADMIN_PASS:-changeme}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}"

# Colored echo helper
info() { echo -e "\033[1;34m➡︎ $*\033[0m"; }

# Start API
info "Starting Fastify API on :8000 …"
npm run start:api &
API_PID=$!

# Start Next.js dashboard
info "Starting Next.js dashboard on :3000 …"
(cd website && npm run dev) &
WEB_PID=$!

trap 'echo "\n🛑 Stopping…"; kill $API_PID $WEB_PID; exit 0' INT TERM

wait 