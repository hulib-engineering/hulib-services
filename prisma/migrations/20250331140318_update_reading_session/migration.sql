/*
  Warnings:

  - You are about to drop the column `authorScheduleId` on the `readingSession` table. All the data in the column will be lost.
  - You are about to alter the column `startTime` on the `readingSession` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(40)`.
  - You are about to alter the column `endTime` on the `readingSession` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(40)`.
  - You are about to drop the `schedules` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userTimeSlot` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `endedAt` on table `readingSession` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `huberId` to the `timeSlot` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "readingSession" DROP CONSTRAINT "readingSession_authorScheduleId_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_humanBookId_fkey";

-- DropForeignKey
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_userLiberId_fkey";

-- DropForeignKey
ALTER TABLE "userTimeSlot" DROP CONSTRAINT "userTimeSlot_timeSlotId_fkey";

-- DropForeignKey
ALTER TABLE "userTimeSlot" DROP CONSTRAINT "userTimeSlot_userId_fkey";

-- AlterTable
ALTER TABLE "readingSession" DROP COLUMN "authorScheduleId",
ALTER COLUMN "startTime" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "endTime" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "endedAt" SET NOT NULL;

-- AlterTable
ALTER TABLE "timeSlot" ADD COLUMN     "huberId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "schedules";

-- DropTable
DROP TABLE "userTimeSlot";

-- AddForeignKey
ALTER TABLE "timeSlot" ADD CONSTRAINT "timeSlot_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
