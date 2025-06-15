#!/bin/sh

# Exit on any error
set -e

# Inject password if provided
if [ -n "$REDIS_PASSWORD" ]; then
  echo "requirepass $REDIS_PASSWORD" >> /usr/local/etc/redis/redis.conf
fi

# Start Redis with config
exec redis-server /usr/local/etc/redis/redis.conf
