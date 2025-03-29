/*
  Warnings:

  - You are about to drop the `timeSlot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `userTimeSlot` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "userTimeSlot" DROP CONSTRAINT "userTimeSlot_timeSlotId_fkey";

-- DropForeignKey
ALTER TABLE "userTimeSlot" DROP CONSTRAINT "userTimeSlot_userId_fkey";

-- AlterTable
ALTER TABLE "readingSession" ADD COLUMN     "endTime" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "startTime" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "startedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "timeSlot";

-- DropTable
DROP TABLE "userTimeSlot";

-- CreateTable
CREATE TABLE "timeSlots" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "timeSlots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "timeSlots_dayOfWeek_startTime_key" ON "timeSlots"("dayOfWeek", "startTime");

-- AddForeignKey
ALTER TABLE "timeSlots" ADD CONSTRAINT "timeSlots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
