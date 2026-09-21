# Plan: fix: Notification creation fails after typeId migration with Null constraint violation on typeId_backup

Issue: #379
Branch: fix/379-notification-create-typeid-backup-null

## Sub-tasks

| # | Sub-task | Done condition |
| ----- | -------- | -------------- |
| 1 | Generate a Prisma migration that makes `notification.typeId_backup` nullable (`DROP NOT NULL`, keeping the rollback copy) | Migration file exists, `prisma migrate status` is clean, and `prisma.notification.create(...)` without `typeId_backup` succeeds |
| 2 | Add a regression test on `NotificationsService.create()` asserting a new notification is inserted with only `notificationType` (no `typeId_backup`) | Test passes on a migrated DB and proves the insert is no longer rejected |

## Decisions / risks
- Keep `typeId_backup` as a nullable rollback copy (matches other `_backup` columns) rather than dropping it; aligns DB with the already-nullable `schema.prisma`.
- `prisma migrate dev` may detect/require syncing other drift — verify no unrelated schema changes are included in the generated migration.
- No app code sets `typeId_backup` (confirmed by grep); schema is the only mismatch.
- In scope: notifications only. Same latent issue on `sticker.statusId_backup`/`chat.*_backup` is out of scope.