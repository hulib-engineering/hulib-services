#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh postgres:5432
# Lấy thời gian hiện tại (format: YYYYMMDDHHMMSS)
npm run schema:drop

CURRENT_TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Tạo tên migration với thời gian hiện tại
MIGRATION_NAME="CreatePostTable_${CURRENT_TIMESTAMP}"

# Chạy lệnh với tên migration
npm run migration:generate -- src/database/migrations/$MIGRATION_NAME
npm run migration:run
npm run seed:run:relational
npm run start:prod > prod.log 2>&1 &
/opt/wait-for-it.sh maildev:1080
/opt/wait-for-it.sh localhost:3000
npm run lint
npm run test:e2e -- --runInBand
