-- CreateTable
CREATE TABLE "story" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "abstract" VARCHAR,
    "coverId" UUID,
    "humanBookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storyReview" (
    "id" SERIAL NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" VARCHAR NOT NULL,
    "comment" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "storyId" INTEGER NOT NULL,

    CONSTRAINT "storyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StoryTopics" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_StoryTopics_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StoryTopics_B_index" ON "_StoryTopics"("B");

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "storyReview" ADD CONSTRAINT "storyReview_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "storyReview" ADD CONSTRAINT "fk_story_review_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "_StoryTopics" ADD CONSTRAINT "_StoryTopics_A_fkey" FOREIGN KEY ("A") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StoryTopics" ADD CONSTRAINT "_StoryTopics_B_fkey" FOREIGN KEY ("B") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
