#!/bin/sh
set -e

if [ -n "$REDIS_PASSWORD" ]; then
  echo "requirepass $REDIS_PASSWORD" >> /usr/local/etc/redis/redis.conf
fi

exec redis-server /usr/local/etc/redis/redis.conf
