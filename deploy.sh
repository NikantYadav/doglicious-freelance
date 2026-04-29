#!/bin/bash

# Exit immediately if any command fails
set -e

echo "Pulling latest changes from git..."
git pull

echo "Stopping existing containers..."
docker compose down

echo "Rebuilding and starting containers..."
docker compose up -d --build

echo "Deployment complete!"