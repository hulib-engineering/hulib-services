-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "file" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "path" VARCHAR NOT NULL,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gender" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "gender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "humanBookTopic" (
    "userId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "humanBookTopic_pkey" PRIMARY KEY ("userId","topicId")
);

-- CreateTable
CREATE TABLE "humanBooks" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bio" VARCHAR,
    "videoUrl" VARCHAR,
    "education" VARCHAR,
    "educationStart" DATE,
    "educationEnd" DATE,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "humanBooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "migrations" (
    "id" SERIAL NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" SERIAL NOT NULL,
    "hash" VARCHAR NOT NULL,
    "createdAt" TIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIME(6),
    "userId" INTEGER,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "status" (
    "id" INTEGER NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topics" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "email" VARCHAR,
    "password" VARCHAR,
    "provider" VARCHAR NOT NULL DEFAULT 'email',
    "socialId" VARCHAR,
    "fullName" VARCHAR,
    "birthday" VARCHAR,
    "createdAt" TIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIME(6),
    "genderId" INTEGER,
    "roleId" INTEGER,
    "statusId" INTEGER,
    "approval" VARCHAR,
    "photoId" UUID,
    "address" VARCHAR,
    "parentPhoneNumber" VARCHAR,
    "phoneNumber" VARCHAR,
    "bio" VARCHAR,
    "videoUrl" VARCHAR,
    "education" VARCHAR,
    "educationStart" DATE,
    "educationEnd" DATE,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "storyTopic" (
    "storyId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "storyTopic_pkey" PRIMARY KEY ("storyId","topicId")
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

-- AddForeignKey
ALTER TABLE "humanBookTopic" ADD CONSTRAINT "fk_topics" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "humanBookTopic" ADD CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "humanBooks" ADD CONSTRAINT "fk_human_books_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "gender"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "story" ADD CONSTRAINT "story_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "storyTopic" ADD CONSTRAINT "storyTopic_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyTopic" ADD CONSTRAINT "storyTopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyReview" ADD CONSTRAINT "storyReview_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "storyReview" ADD CONSTRAINT "fk_story_review_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

