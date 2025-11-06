-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "appeal" (
    "id" SERIAL NOT NULL,
    "moderationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" VARCHAR NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "appeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appeal_moderationId_idx" ON "appeal"("moderationId");

-- CreateIndex
CREATE INDEX "appeal_userId_idx" ON "appeal"("userId");

-- CreateIndex
CREATE INDEX "appeal_status_idx" ON "appeal"("status");

-- CreateIndex
CREATE INDEX "appeal_createdAt_idx" ON "appeal"("createdAt");

-- AddForeignKey
ALTER TABLE "appeal" ADD CONSTRAINT "appeal_moderationId_fkey" FOREIGN KEY ("moderationId") REFERENCES "moderation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeal" ADD CONSTRAINT "appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
