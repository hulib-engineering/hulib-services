#!/bin/bash


# In ra thời gian deploy
echo "Starting deployment at $(date)"

echo "Pulling latest code from repository..."
git pull || { echo "Failed pull"; exit 1; }

echo "Stopping Docker images..."
sudo docker-compose -f docker-compose.prod.yaml down || { echo "Failed to stop containers"; exit 1; }

echo "Building Docker images..."
sudo docker-compose -f docker-compose.prod.yaml build || { echo "Failed to build containers"; exit 1; }

echo "Starting the application containers..."
sudo docker-compose -f docker-compose.prod.yaml up -d || { echo "Failed to start containers"; exit 1; }

# Hoàn thành deploy
echo "Deployment completed successfully at $(date)"