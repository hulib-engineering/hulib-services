-- Split the shared `status` lookup table into `userStatus` (user.statusId)
-- and `stickerStatus` (sticker.statusId), preserving existing rows (the two
-- tables intentionally share the same seed values for now).

-- CreateTable
CREATE TABLE "userStatus" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "userStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stickerStatus" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "stickerStatus_pkey" PRIMARY KEY ("id")
);

-- Copy existing status rows into both new tables so the FK swap loses no data.
INSERT INTO "userStatus" ("id", "name") SELECT "id", "name" FROM "status";
INSERT INTO "stickerStatus" ("id", "name") SELECT "id", "name" FROM "status";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_statusId_fkey";

-- DropForeignKey
ALTER TABLE "sticker" DROP CONSTRAINT "sticker_statusId_fkey";

-- DropTable
DROP TABLE "status";

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "userStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sticker" ADD CONSTRAINT "sticker_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "stickerStatus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;