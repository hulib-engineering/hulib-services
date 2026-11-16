-- AlterTable
ALTER TABLE "readingSession" ADD COLUMN     "feedbackSubmittedAt" TIMESTAMP(6),
ADD COLUMN     "feelingRating" INTEGER,
ADD COLUMN     "satisfactionRating" INTEGER,
ADD COLUMN     "sessionContent" VARCHAR(4000),
ADD COLUMN     "huberRating" INTEGER,
ADD COLUMN     "huberContent" VARCHAR(4000),
ADD COLUMN     "huberFeedbackSkipped" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "feedback" ADD COLUMN     "readingSessionId" INTEGER;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_readingSessionId_fkey" FOREIGN KEY ("readingSessionId") REFERENCES "readingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
