/*
  Warnings:

  - You are about to drop the `Sticker` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Sticker" DROP CONSTRAINT "Sticker_imageId_fkey";

-- DropForeignKey
ALTER TABLE "chat" DROP CONSTRAINT "chat_stickerId_fkey";

-- DropTable
DROP TABLE "Sticker";

-- CreateTable
CREATE TABLE "sticker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageId" UUID,
    "category" TEXT,
    "statusId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sticker" ADD CONSTRAINT "sticker_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker" ADD CONSTRAINT "sticker_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "sticker"("id") ON DELETE SET NULL ON UPDATE CASCADE;
