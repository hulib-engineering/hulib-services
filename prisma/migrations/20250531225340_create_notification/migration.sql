-- CreateEnum
CREATE TYPE "notifType" AS ENUM ('sessionRequest', 'account', 'contentModeration', 'other');

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "type" "notifType" NOT NULL DEFAULT 'sessionRequest',
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "relatedEntityId" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_relatedEntityId_fkey" FOREIGN KEY ("relatedEntityId") REFERENCES "story"("id") ON DELETE SET NULL ON UPDATE CASCADE;
