ALTER TABLE "user" ADD COLUMN "huberSince" TIMESTAMP(6);

UPDATE "user" AS u
SET "huberSince" = COALESCE(
  (
    SELECT MIN(hb."createdAt")
    FROM "humanBooks" AS hb
    WHERE hb."userId" = u."id"
  ),
  CURRENT_TIMESTAMP
)
WHERE u."roleId" = 2;
