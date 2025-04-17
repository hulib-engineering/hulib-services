/*
  Warnings:

  - You are about to drop the `huberSharingTopic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "huberSharingTopic" DROP CONSTRAINT "fk_topics";

-- DropForeignKey
ALTER TABLE "huberSharingTopic" DROP CONSTRAINT "fk_user";

-- DropTable
DROP TABLE "huberSharingTopic";

-- CreateTable
-- CREATE TABLE "humanBookTopic" (
--     "userId" INTEGER NOT NULL,
--     "topicId" INTEGER NOT NULL,

--     CONSTRAINT "humanBookTopic_pkey" PRIMARY KEY ("userId","topicId")
-- );

-- AddForeignKey
ALTER TABLE "humanBookTopic" ADD CONSTRAINT "fk_topics" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "humanBookTopic" ADD CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
