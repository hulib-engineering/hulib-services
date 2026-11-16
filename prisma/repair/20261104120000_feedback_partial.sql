-- Reconcile only databases where this migration was partially applied manually.
-- Do not edit an already-released Prisma migration or run this blindly on other databases.
BEGIN;
ALTER TABLE "readingSession"
  ADD COLUMN IF NOT EXISTS "feedbackSubmittedAt" TIMESTAMP(6),
  ADD COLUMN IF NOT EXISTS "feelingRating" INTEGER,
  ADD COLUMN IF NOT EXISTS "satisfactionRating" INTEGER,
  ADD COLUMN IF NOT EXISTS "sessionContent" VARCHAR(4000),
  ADD COLUMN IF NOT EXISTS "huberRating" INTEGER,
  ADD COLUMN IF NOT EXISTS "huberContent" VARCHAR(4000),
  ADD COLUMN IF NOT EXISTS "huberFeedbackSkipped" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "readingSessionId" INTEGER;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = '"feedback"'::regclass
      AND conname = 'feedback_readingSessionId_fkey'
  ) THEN
    ALTER TABLE "feedback" ADD CONSTRAINT "feedback_readingSessionId_fkey"
      FOREIGN KEY ("readingSessionId") REFERENCES "readingSession"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
COMMIT;
