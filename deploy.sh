#!/bin/bash

set -euo pipefail

# In ra thời gian deploy
echo "Starting deployment at $(date)"

echo "Pulling latest code from repository..."
DEPLOY_BRANCH="${DEPLOY_BRANCH:-$(git rev-parse --abbrev-ref HEAD)}"

git fetch origin "${DEPLOY_BRANCH}" || { echo "Failed fetch"; exit 1; }
git checkout -f "${DEPLOY_BRANCH}" || { echo "Failed checkout ${DEPLOY_BRANCH}"; exit 1; }
git reset --hard "origin/${DEPLOY_BRANCH}" || { echo "Failed reset to origin/${DEPLOY_BRANCH}"; exit 1; }

echo "Deploying commit $(git rev-parse --short HEAD) on ${DEPLOY_BRANCH}"

echo "Starting the application containers..."
docker-compose -f docker-compose.prod.yaml up -d --build || { echo "Failed to start containers"; exit 1; }

# Hoàn thành deploy
echo "Deployment completed successfully at $(date)"
ss