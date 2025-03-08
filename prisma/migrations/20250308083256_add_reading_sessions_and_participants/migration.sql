/*
  Warnings:

  - You are about to drop the `ReadingSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ReadingSessionParticipant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ReadingSessionParticipant" DROP CONSTRAINT "ReadingSessionParticipant_readingSessionId_fkey";

-- DropTable
DROP TABLE "ReadingSession";

-- DropTable
DROP TABLE "ReadingSessionParticipant";

-- CreateTable
CREATE TABLE "readingSession" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionStatus" "ReadingSessionStatus" NOT NULL DEFAULT 'PENDING',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "hostId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readingSessionParticipant" (
    "id" TEXT NOT NULL,
    "readingSessionId" TEXT NOT NULL,
    "participantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "readingSessionParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_session_status" ON "readingSession"("sessionStatus");

-- CreateIndex
CREATE INDEX "idx_start_time" ON "readingSession"("startTime");

-- CreateIndex
CREATE INDEX "idx_host_status_time" ON "readingSession"("hostId", "sessionStatus", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "readingSessionParticipant_readingSessionId_participantId_key" ON "readingSessionParticipant"("readingSessionId", "participantId");

-- AddForeignKey
ALTER TABLE "readingSessionParticipant" ADD CONSTRAINT "readingSessionParticipant_readingSessionId_fkey" FOREIGN KEY ("readingSessionId") REFERENCES "readingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
