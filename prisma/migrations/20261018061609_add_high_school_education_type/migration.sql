/*
  Warnings:

  - You are about to drop the `NotificationType` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "EducationType" ADD VALUE 'high_school';

-- AlterTable
ALTER TABLE "session" ALTER COLUMN "createdAt" SET DATA TYPE TIME(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIME(6),
ALTER COLUMN "deletedAt" SET DATA TYPE TIME(6);

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "createdAt" SET DATA TYPE TIME(6),
ALTER COLUMN "updatedAt" SET DATA TYPE TIME(6),
ALTER COLUMN "deletedAt" SET DATA TYPE TIME(6);

-- DropTable
DROP TABLE "NotificationType";
