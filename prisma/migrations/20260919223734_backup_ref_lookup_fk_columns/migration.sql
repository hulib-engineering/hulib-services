-- Step 1: the lookup tables (gender, role, userStatus, stickerStatus,
-- chatType, sticker, notificationType) move from FK-referenced lookups to
-- plain const values stored directly on the owning tables.
--
-- Each FK column is renamed to `<column>_backup` and left untouched as a
-- rollback copy (no code reads it). A fresh column with the original name is
-- added and backfilled with the same values, then the foreign-key constraints
-- are dropped. The lookup tables themselves are intentionally NOT dropped
-- yet (see step 2).

-- user.genderId / roleId / statusId
ALTER TABLE "user" RENAME COLUMN "genderId" TO "genderId_backup";
ALTER TABLE "user" RENAME COLUMN "roleId" TO "roleId_backup";
ALTER TABLE "user" RENAME COLUMN "statusId" TO "statusId_backup";

ALTER TABLE "user" ADD COLUMN "genderId" INTEGER;
ALTER TABLE "user" ADD COLUMN "roleId" INTEGER;
ALTER TABLE "user" ADD COLUMN "statusId" INTEGER;

UPDATE "user"
SET "genderId" = "genderId_backup",
    "roleId" = "roleId_backup",
    "statusId" = "statusId_backup";

ALTER TABLE "user" DROP CONSTRAINT "user_genderId_fkey";
ALTER TABLE "user" DROP CONSTRAINT "user_roleId_fkey";
ALTER TABLE "user" DROP CONSTRAINT "user_statusId_fkey";

-- chat.chatTypeId / stickerId
ALTER TABLE "chat" RENAME COLUMN "chatTypeId" TO "chatTypeId_backup";
ALTER TABLE "chat" RENAME COLUMN "stickerId" TO "stickerId_backup";

ALTER TABLE "chat" ALTER COLUMN "chatTypeId_backup" DROP DEFAULT;
ALTER TABLE "chat" ADD COLUMN "chatTypeId" INTEGER DEFAULT 1;
ALTER TABLE "chat" ADD COLUMN "stickerId" INTEGER;

UPDATE "chat"
SET "chatTypeId" = "chatTypeId_backup",
    "stickerId" = "stickerId_backup";

ALTER TABLE "chat" DROP CONSTRAINT "chat_chatTypeId_fkey";
ALTER TABLE "chat" DROP CONSTRAINT "chat_stickerId_fkey";

-- notification.typeId
ALTER TABLE "notification" RENAME COLUMN "typeId" TO "typeId_backup";

ALTER TABLE "notification" ADD COLUMN "typeId" INTEGER;

UPDATE "notification" SET "typeId" = "typeId_backup";

ALTER TABLE "notification" DROP CONSTRAINT "notification_typeId_fkey";

-- sticker.statusId
ALTER TABLE "sticker" RENAME COLUMN "statusId" TO "statusId_backup";

ALTER TABLE "sticker" ADD COLUMN "statusId" INTEGER;

UPDATE "sticker" SET "statusId" = "statusId_backup";

ALTER TABLE "sticker" DROP CONSTRAINT "sticker_statusId_fkey";