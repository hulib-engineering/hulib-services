/*
  Warnings:

  - You are about to drop the column `readingSessionId` on the `feedback` table. All the data in the column will be lost.
  - You are about to drop the `schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userTimeSlot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "feedback" DROP CONSTRAINT "feedback_readingSessionId_fkey";

-- DropForeignKey
-- ALTER TABLE "userTimeSlot" DROP CONSTRAINT "userTimeSlot_timeSlotId_fkey";

-- DropForeignKey
ALTER TABLE "userTimeSlot" DROP CONSTRAINT "userTimeSlot_userId_fkey";

-- DropIndex
--DROP INDEX "timeSlot_dayOfWeek_startTime_key";

-- AlterTable
ALTER TABLE "feedback" DROP COLUMN "readingSessionId",
ADD COLUMN     "feedbackById" INTEGER,
ADD COLUMN     "feedbackToId" INTEGER;

-- AlterTable
ALTER TABLE "readingSession" ALTER COLUMN "sessionUrl" SET DATA TYPE VARCHAR(1000),
ALTER COLUMN "recordingUrl" SET DATA TYPE VARCHAR(500);

-- DropTable
DROP TABLE "schedules";

-- DropTable
DROP TABLE "userTimeSlot";

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_feedbackById_fkey" FOREIGN KEY ("feedbackById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_feedbackToId_fkey" FOREIGN KEY ("feedbackToId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
--ALTER TABLE "message" ADD CONSTRAINT "message_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
--ALTER TABLE "message" ADD CONSTRAINT "message_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
