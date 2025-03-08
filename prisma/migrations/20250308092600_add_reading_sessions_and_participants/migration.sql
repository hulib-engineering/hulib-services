-- CreateEnum
CREATE TYPE "ReadingSessionStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'PENDING');

-- CreateTable
CREATE TABLE "readingSession" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sessionStatus" "ReadingSessionStatus" NOT NULL DEFAULT 'PENDING',
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "hostId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "readingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readingSessionParticipant" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "readingSessionId" UUID NOT NULL,
    "participantId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

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
