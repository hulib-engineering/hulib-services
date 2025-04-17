/*
  Warnings:

  - You are about to drop the `humanBookTopic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userTimeSlot` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `huberId` to the `timeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
-- CREATE TYPE "ReadingSessionStatus" AS ENUM ('finished', 'canceled', 'pending', 'rejected', 'approved', 'unInitialized');

-- DropForeignKey
ALTER TABLE "humanBookTopic" DROP CONSTRAINT "fk_topics";

-- DropForeignKey
ALTER TABLE "humanBookTopic" DROP CONSTRAINT "fk_user";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_humanBookId_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_userLiberId_fkey";

-- DropForeignKey
-- ALTER TABLE "userTimeSlot" DROP CONSTRAINT "userTimeSlot_timeSlotId_fkey";

-- DropForeignKey
-- ALTER TABLE "userTimeSlot" DROP CONSTRAINT "userTimeSlot_userId_fkey";

-- DropIndex
-- DROP INDEX "timeSlot_dayOfWeek_startTime_key";

-- AlterTable
-- ALTER TABLE "timeSlot" ADD COLUMN     "huberId" INTEGER NOT NULL;

-- DropTable
-- DROP TABLE "humanBookTopic";

-- -- DropTable
-- DROP TABLE "schedules";

-- -- DropTable
-- DROP TABLE "userTimeSlot";

-- CreateTable
CREATE TABLE "huberSharingTopic" (
    "userId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "huberSharingTopic_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateTable
CREATE TABLE "liberTopicOfInterest" (
    "userId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "liberTopicOfInterest_pkey" PRIMARY KEY ("userId","topicId")
);

-- -- CreateTable
-- CREATE TABLE "readingSession" (
--     "id" SERIAL NOT NULL,
--     "humanBookId" INTEGER NOT NULL,
--     "readerId" INTEGER NOT NULL,
--     "storyId" INTEGER NOT NULL,
--     "note" VARCHAR(4000),
--     "review" VARCHAR(4000),
--     "sessionUrl" VARCHAR(255) NOT NULL,
--     "recordingUrl" VARCHAR(255),
--     "sessionStatus" "ReadingSessionStatus" NOT NULL DEFAULT 'pending',
--     "startedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "startTime" VARCHAR(40) NOT NULL,
--     "endedAt" TIMESTAMP(6) NOT NULL,
--     "endTime" VARCHAR(40) NOT NULL,
--     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "deletedAt" TIMESTAMP(3),

--     CONSTRAINT "readingSession_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "feedback" (
--     "id" SERIAL NOT NULL,
--     "readingSessionId" INTEGER NOT NULL,
--     "rating" DOUBLE PRECISION NOT NULL,
--     "content" VARCHAR(4000),
--     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "deletedAt" TIMESTAMP(3),

--     CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
-- );

-- -- CreateTable
-- CREATE TABLE "message" (
--     "id" SERIAL NOT NULL,
--     "readingSessionId" INTEGER NOT NULL,
--     "humanBookId" INTEGER NOT NULL,
--     "readerId" INTEGER NOT NULL,
--     "content" VARCHAR(4000) NOT NULL,
--     "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "deletedAt" TIMESTAMP(3),

--     CONSTRAINT "message_pkey" PRIMARY KEY ("id")
-- );

-- AddForeignKey
ALTER TABLE "huberSharingTopic" ADD CONSTRAINT "fk_topics" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "huberSharingTopic" ADD CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "liberTopicOfInterest" ADD CONSTRAINT "fk_topics" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "liberTopicOfInterest" ADD CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "timeSlot" ADD CONSTRAINT "timeSlot_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_readingSessionId_fkey" FOREIGN KEY ("readingSessionId") REFERENCES "readingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_readingSessionId_fkey" FOREIGN KEY ("readingSessionId") REFERENCES "readingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "message" ADD CONSTRAINT "message_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- -- AddForeignKey
-- ALTER TABLE "message" ADD CONSTRAINT "message_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
