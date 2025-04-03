CREATE TYPE "ReadingSessionStatus" AS ENUM ('finished', 'unInitialized', 'canceled', 'pending', 'rejected', 'approved');

CREATE TABLE "readingSession" (
    "id" SERIAL NOT NULL,
    "humanBookId" INTEGER NOT NULL,
    "readerId" INTEGER NOT NULL,
    "storyId" INTEGER NOT NULL,
    "note" VARCHAR(4000),
    "review" VARCHAR(4000),
    "sessionUrl" VARCHAR(255) NOT NULL,
    "recordingUrl" VARCHAR(255),
    "sessionStatus" "ReadingSessionStatus" NOT NULL DEFAULT 'unInitialized',
    "startTime" VARCHAR(255) NOT NULL, 
    "endTime" VARCHAR(255) NOT NULL,   
    "startedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "readingSession_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_authorScheduleId_fkey" FOREIGN KEY ("authorScheduleId") REFERENCES "schedules"("schedulesId") ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "readingSessionId" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "content" VARCHAR(4000),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "feedback" ADD CONSTRAINT "feedback_readingSessionId_fkey" FOREIGN KEY ("readingSessionId") REFERENCES "readingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;


CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "readingSessionId" INTEGER NOT NULL,
    "humanBookId" INTEGER NOT NULL,
    "readerId" INTEGER NOT NULL,
    "content" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "message" ADD CONSTRAINT "message_readingSessionId_fkey" FOREIGN KEY ("readingSessionId") REFERENCES "readingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message" ADD CONSTRAINT "message_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "message" ADD CONSTRAINT "message_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
