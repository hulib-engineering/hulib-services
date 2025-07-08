-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "readAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "chat_recipientId_readAt_idx" ON "chat"("recipientId", "readAt");
