/*
  Warnings:

  - You are about to drop the `_StoryTopics` table. If the table is not empty, all the data it contains will be lost.

*/
-- -- DropForeignKey
-- ALTER TABLE "_StoryTopics" DROP CONSTRAINT "_StoryTopics_A_fkey";

-- -- DropForeignKey
-- ALTER TABLE "_StoryTopics" DROP CONSTRAINT "_StoryTopics_B_fkey";

-- -- DropTable
-- DROP TABLE "_StoryTopics";

-- CreateTable
CREATE TABLE "storyTopic" (
    "storyId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "storyTopic_pkey" PRIMARY KEY ("storyId","topicId")
);

-- AddForeignKey
ALTER TABLE "storyTopic" ADD CONSTRAINT "storyTopic_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyTopic" ADD CONSTRAINT "storyTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
