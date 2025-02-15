#!/bin/bash


# In ra thời gian deploy
echo "Starting deployment at $(date)"

echo "Pulling latest code from repository..."
git pull || { echo "Failed pull"; exit 1; }

echo "Starting the application containers..."
docker-compose -f docker-compose.prod.yaml up -d --build || { echo "Failed to start containers"; exit 1; }

# Hoàn thành deploy
echo "Deployment completed successfully at $(date)"