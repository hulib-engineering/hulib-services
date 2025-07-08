-- AlterTable
ALTER TABLE "chat" ADD COLUMN     "chatTypeId" INTEGER DEFAULT 1;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_chatTypeId_fkey" FOREIGN KEY ("chatTypeId") REFERENCES "chatType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
