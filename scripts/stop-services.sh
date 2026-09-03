#!/usr/bin/env bash
set -e

echo "[STOP] Terminating all running servers and background workers..."

# Terminate processes by port 3000 (web), 3001 (api), 8000 (ai-service)
fuser -k 3000/tcp 3001/tcp 8000/tcp 2>/dev/null || true

# Terminate node, tsc-watch, next, and uvicorn processes
pkill -f "next dev|tsc-watch|uvicorn|node dist/index.js|node dist/worker/standalone.js" 2>/dev/null || true

# Terminate docker compose services if active
docker compose -f docker-compose.dev.yml down 2>/dev/null || true

echo "[STOP] All services stopped cleanly."
