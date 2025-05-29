/*
  Warnings:

  - You are about to drop the column `review` on the `readingSession` table. All the data in the column will be lost.
  - Added the required column `preRating` to the `feedback` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preRating` to the `storyReview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feedback" ADD COLUMN     "preRating" INTEGER;

-- AlterTable
ALTER TABLE "readingSession" DROP COLUMN "review",
ADD COLUMN     "preRating" INTEGER,
ADD COLUMN     "rating" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "storyReview" ADD COLUMN     "preRating" INTEGER;
