-- notification.typeId_backup is a preserved rollback copy of the old `typeId`
-- FK. It keeps the original NOT NULL constraint, but the app no longer writes
-- to it, so new inserts fail with a null constraint violation. Align the DB
-- with schema.prisma (notification.typeId_backup Int?).

ALTER TABLE "notification" ALTER COLUMN "typeId_backup" DROP NOT NULL;