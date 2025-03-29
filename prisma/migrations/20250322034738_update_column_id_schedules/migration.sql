/*
  Warnings:

  - The primary key for the `schedules` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `schedulesId` on the `schedules` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "readingSession" DROP CONSTRAINT "readingSession_authorScheduleId_fkey";

-- AlterTable
ALTER TABLE "schedules" DROP CONSTRAINT "schedules_pkey",
DROP COLUMN "schedulesId",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_authorScheduleId_fkey" FOREIGN KEY ("authorScheduleId") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
