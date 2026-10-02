#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432
npx prisma migrate deploy
# npx prisma db seed
npm run start:prod
