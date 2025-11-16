/*
  Warnings:

  - You are about to drop the column `education` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `educationEnd` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `educationStart` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "education",
DROP COLUMN "educationEnd",
DROP COLUMN "educationStart";
