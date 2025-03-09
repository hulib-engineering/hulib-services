/*
  Warnings:

  - Added the required column `userLiberId` to the `schedules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "userLiberId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_userLiberId_fkey" FOREIGN KEY ("userLiberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
