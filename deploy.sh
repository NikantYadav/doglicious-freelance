#!/bin/bash
set -e

echo "▶ Pulling latest changes..."
git pull

echo "▶ Building new images (site stays live)..."
docker compose build --no-cache

echo "▶ Restarting backend..."
docker compose up -d --no-deps backend

echo "   Waiting for backend to become healthy..."
for i in $(seq 1 15); do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' vetrxscan-backend 2>/dev/null || echo "none")
  if [ "$STATUS" = "healthy" ]; then
    echo "   Backend healthy ✓"
    break
  fi
  echo "   ($i/15) Status: $STATUS — waiting 5s..."
  sleep 5
done

echo "▶ Restarting frontend..."
docker compose up -d --no-deps frontend

echo "✅ Deployment complete — no downtime!"
