-- AlterTable
ALTER TABLE "chat"
-- ADD COLUMN     "chatTypeId" INTEGER DEFAULT 1,
ADD COLUMN     "readAt" TIMESTAMP(3),
ADD COLUMN     "stickerId" INTEGER,
ALTER COLUMN "message" DROP NOT NULL;

-- CreateTable
CREATE TABLE "chatType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "chatType_pkey" PRIMARY KEY ("id")
);

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

-- CreateIndex
CREATE UNIQUE INDEX "chatType_name_key" ON "chatType"("name");

-- CreateIndex
CREATE INDEX "chat_recipientId_readAt_idx" ON "chat"("recipientId", "readAt");

-- AddForeignKey
ALTER TABLE "sticker" ADD CONSTRAINT "sticker_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker" ADD CONSTRAINT "sticker_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "sticker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
-- ALTER TABLE "chat" ADD CONSTRAINT "chat_chatTypeId_fkey" FOREIGN KEY ("chatTypeId") REFERENCES "chatType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
