-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('warn', 'unwarn', 'ban', 'unban');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('active', 'reversed');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "warnCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "moderation" (
    "id" SERIAL NOT NULL,
    "actionType" "ModerationActionType" NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'active',
    "userId" INTEGER NOT NULL,
    "reportId" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "moderation_userId_idx" ON "moderation"("userId");

-- CreateIndex
CREATE INDEX "moderation_reportId_idx" ON "moderation"("reportId");

-- CreateIndex
CREATE INDEX "moderation_userId_actionType_status_idx" ON "moderation"("userId", "actionType", "status");

-- CreateIndex
CREATE INDEX "moderation_createdAt_idx" ON "moderation"("createdAt");

-- AddForeignKey
ALTER TABLE "moderation" ADD CONSTRAINT "moderation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation" ADD CONSTRAINT "moderation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE SET NULL ON UPDATE CASCADE;
