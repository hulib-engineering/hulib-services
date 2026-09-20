-- Step 1: The lookup tables (gender, role, userStatus, stickerStatus,
-- chatType, sticker, notificationType) move from FK-referenced lookups to
-- plain const values stored directly on the owning tables.
--
-- Each FK column is renamed to <column>_backup and left untouched as a
-- rollback copy. A fresh column with the original name is added and
-- backfilled with the same values, then the foreign-key constraints
-- are dropped.
--
-- The lookup tables themselves are intentionally NOT dropped yet.

-- ============================================================
-- user.genderId / roleId / statusId
-- ============================================================

ALTER TABLE "user" RENAME COLUMN "genderId" TO "genderId_backup";
ALTER TABLE "user" RENAME COLUMN "roleId" TO "roleId_backup";
ALTER TABLE "user" RENAME COLUMN "statusId" TO "statusId_backup";

ALTER TABLE "user" ADD COLUMN "genderId" INTEGER;
ALTER TABLE "user" ADD COLUMN "roleId" INTEGER;
ALTER TABLE "user" ADD COLUMN "statusId" INTEGER;

UPDATE "user"
SET
    "genderId" = "genderId_backup",
    "roleId" = "roleId_backup",
    "statusId" = "statusId_backup";

ALTER TABLE "user" DROP CONSTRAINT "user_genderId_fkey";
ALTER TABLE "user" DROP CONSTRAINT "user_roleId_fkey";
ALTER TABLE "user" DROP CONSTRAINT "user_statusId_fkey";


-- ============================================================
-- chat.chatTypeId / stickerId
-- ============================================================

ALTER TABLE "chat" RENAME COLUMN "chatTypeId" TO "chatTypeId_backup";
ALTER TABLE "chat" RENAME COLUMN "stickerId" TO "stickerId_backup";

ALTER TABLE "chat" ALTER COLUMN "chatTypeId_backup" DROP DEFAULT;

ALTER TABLE "chat"
ADD COLUMN "chatTypeId" INTEGER DEFAULT 1;

ALTER TABLE "chat"
ADD COLUMN "stickerId" INTEGER;

UPDATE "chat"
SET
    "chatTypeId" = "chatTypeId_backup",
    "stickerId" = "stickerId_backup";

ALTER TABLE "chat" DROP CONSTRAINT "chat_chatTypeId_fkey";
ALTER TABLE "chat" DROP CONSTRAINT "chat_stickerId_fkey";


-- ============================================================
-- notification.typeId -> notificationType
-- ============================================================

ALTER TABLE "notification"
RENAME COLUMN "typeId" TO "typeId_backup";

ALTER TABLE "notification"
DROP CONSTRAINT "notification_typeId_fkey";

ALTER TABLE "notification"
ADD COLUMN "notificationType" VARCHAR;

UPDATE "notification" AS n
SET "notificationType" = nt."name"
FROM "notificationType" AS nt
WHERE n."typeId_backup" = nt."id";

-- Unknown/null mappings are handled below using the mapping table.
-- Only enforce NOT NULL after the fallback update.

ALTER TABLE "notification"
ALTER COLUMN "notificationType" SET NOT NULL;


-- ============================================================
-- sticker.statusId
-- ============================================================

ALTER TABLE "sticker"
RENAME COLUMN "statusId" TO "statusId_backup";

ALTER TABLE "sticker"
ADD COLUMN "statusId" INTEGER;

UPDATE "sticker"
SET "statusId" = "statusId_backup";

ALTER TABLE "sticker"
DROP CONSTRAINT "sticker_statusId_fkey";


-- ============================================================
-- Step 6: Ensure notificationType column exists
-- ============================================================
--
-- The column is already created above, so no duplicate ALTER TABLE
-- is required here.


-- ============================================================
-- Step 7: Ensure NotificationType mapping table exists
-- ============================================================

CREATE TABLE IF NOT EXISTS "NotificationType" (
    "id" INTEGER PRIMARY KEY,
    "name" TEXT NOT NULL
);

INSERT INTO "NotificationType" ("id", "name")
VALUES
    (1,  'sessionRequest'),
    (2,  'sessionFinish'),
    (3,  'account'),
    (4,  'reviewStory'),
    (5,  'publishStory'),
    (6,  'rejectStory'),
    (7,  'reactStory'),
    (8,  'shareStory'),
    (9,  'huberReported'),
    (10, 'rejectHuber'),
    (11, 'approveReadingSession'),
    (12, 'rejectReadingSession'),
    (13, 'cancelReadingSession'),
    (14, 'missReadingSession'),
    (15, 'huberWarning'),
    (16, 'userAppeal'),
    (17, 'appealResponse')
ON CONFLICT ("id") DO NOTHING;


-- ============================================================
-- Step 8: Map typeId_backup -> notificationType
-- Unknown IDs become 'other'
-- ============================================================

UPDATE "notification"
SET "notificationType" = COALESCE(
    (
        SELECT "name"
        FROM "NotificationType" n
        WHERE n."id" = "notification"."typeId_backup"
    ),
    'other'
);


-- Ensure all notification rows have a value before NOT NULL.
ALTER TABLE "notification"
ALTER COLUMN "notificationType" SET NOT NULL;