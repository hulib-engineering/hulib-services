#!/bin/sh
set -e

echo "Decrypting .env.staging..."
npx dotenvx decrypt -f .env.staging

echo "Loading environment..."
set -a
. .env.staging
set +a

echo "Running migrations and starting app..."
npm run migration:run && npm run start:prod
