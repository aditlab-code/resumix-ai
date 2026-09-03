#!/usr/bin/env bash
set -e

echo "[START] Ensuring PostgreSQL & Redis Docker containers are running..."
docker compose -f docker-compose.dev.yml up -d postgres redis

echo "[START] Launching AI Service, Core API, BullMQ Worker, and Frontend Web..."
npm run dev:local
