/*
  Warnings:

  - You are about to drop the `_StoryTopics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_StoryTopics" DROP CONSTRAINT "_StoryTopics_A_fkey";

-- DropForeignKey
ALTER TABLE "_StoryTopics" DROP CONSTRAINT "_StoryTopics_B_fkey";

-- DropTable
DROP TABLE "_StoryTopics";

-- CreateTable
CREATE TABLE "storyFavorite" (
    "userId" INTEGER NOT NULL,
    "storyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storyFavorite_pkey" PRIMARY KEY ("userId","storyId")
);

-- AddForeignKey
ALTER TABLE "storyFavorite" ADD CONSTRAINT "storyFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyFavorite" ADD CONSTRAINT "storyFavorite_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;
