-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateEnum
CREATE TYPE "TopicColor" AS ENUM ('yellow', 'orange', 'pink', 'lavender', 'green', 'blue', 'primary');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('active', 'inactive');

-- CreateEnum
CREATE TYPE "ReadingSessionStatus" AS ENUM ('finished', 'canceled', 'pending', 'rejected', 'approved', 'unInitialized', 'missed');

-- CreateEnum
CREATE TYPE "chatStatus" AS ENUM ('sent', 'delivered', 'read', 'deleted');

-- CreateEnum
CREATE TYPE "EducationType" AS ENUM ('vocational', 'university', 'life_experience');

-- CreateEnum
CREATE TYPE "ModerationActionType" AS ENUM ('warn', 'unwarn', 'ban', 'unban');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('active', 'reversed');

-- CreateEnum
CREATE TYPE "AppealStatus" AS ENUM ('pending', 'accepted', 'rejected');

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
CREATE TABLE "liberTopicOfInterest" (
    "userId" INTEGER NOT NULL,
    "topicId" INTEGER NOT NULL,

    CONSTRAINT "liberTopicOfInterest_pkey" PRIMARY KEY ("userId","topicId")
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
    "color" "TopicColor" NOT NULL DEFAULT 'primary',
    "status" "TopicStatus" NOT NULL DEFAULT 'inactive',
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
    "coverImageId" UUID,
    "address" VARCHAR,
    "parentPhoneNumber" VARCHAR,
    "phoneNumber" VARCHAR,
    "bio" VARCHAR,
    "videoUrl" VARCHAR,
    "warnCount" INTEGER NOT NULL DEFAULT 0,
    "huberSince" TIMESTAMP(6),
    "hasSeenHuberOnboarding" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "story" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR NOT NULL,
    "abstract" VARCHAR,
    "coverId" UUID,
    "humanBookId" INTEGER NOT NULL,
    "publishStatus" INTEGER NOT NULL DEFAULT 1,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "sharedUserIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "likedUserIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rejectionReason" TEXT,

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
    "preRating" INTEGER,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "storyId" INTEGER NOT NULL,

    CONSTRAINT "storyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storyFavorite" (
    "userId" INTEGER NOT NULL,
    "storyId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "storyFavorite_pkey" PRIMARY KEY ("userId","storyId")
);

-- CreateTable
CREATE TABLE "timeSlot" (
    "id" SERIAL NOT NULL,
    "huberId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readingSession" (
    "id" SERIAL NOT NULL,
    "humanBookId" INTEGER NOT NULL,
    "readerId" INTEGER NOT NULL,
    "storyId" INTEGER NOT NULL,
    "note" VARCHAR(4000),
    "preRating" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "sessionUrl" VARCHAR(1000) NOT NULL,
    "recordingUrl" VARCHAR(500),
    "sessionStatus" "ReadingSessionStatus" NOT NULL DEFAULT 'pending',
    "startedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" VARCHAR(40) NOT NULL,
    "endedAt" TIMESTAMP(6) NOT NULL,
    "endTime" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "rejectReason" TEXT,

    CONSTRAINT "readingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feedback" (
    "id" SERIAL NOT NULL,
    "feedbackById" INTEGER,
    "feedbackToId" INTEGER,
    "rating" DOUBLE PRECISION NOT NULL,
    "preRating" INTEGER,
    "content" VARCHAR(4000),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" SERIAL NOT NULL,
    "readingSessionId" INTEGER NOT NULL,
    "humanBookId" INTEGER NOT NULL,
    "readerId" INTEGER NOT NULL,
    "content" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "typeId" INTEGER NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    "relatedEntityId" INTEGER,
    "extraNote" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificationType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "notificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chatType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "chatType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sticker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageId" UUID,
    "category" TEXT,
    "statusId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "recipientId" INTEGER NOT NULL,
    "message" VARCHAR(4000),
    "status" "chatStatus" NOT NULL DEFAULT 'sent',
    "chatTypeId" INTEGER DEFAULT 1,
    "stickerId" INTEGER,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "customReason" TEXT,
    "rejectedReason" TEXT,
    "rejectedCustomReason" TEXT,
    "markAsResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporterId" INTEGER NOT NULL,
    "reportedUserId" INTEGER NOT NULL,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "huberFavorite" (
    "userId" INTEGER NOT NULL,
    "huberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "huberFavorite_pkey" PRIMARY KEY ("userId","huberId")
);

-- CreateTable
CREATE TABLE "education" (
    "id" SERIAL NOT NULL,
    "major" VARCHAR NOT NULL,
    "institution" VARCHAR NOT NULL,
    "startedAt" DATE NOT NULL,
    "endedAt" DATE,
    "huberId" INTEGER NOT NULL,
    "type" "EducationType",
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work" (
    "id" SERIAL NOT NULL,
    "position" VARCHAR NOT NULL,
    "company" VARCHAR NOT NULL,
    "startedAt" DATE NOT NULL,
    "endedAt" DATE,
    "huberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation" (
    "id" SERIAL NOT NULL,
    "actionType" "ModerationActionType" NOT NULL,
    "status" "ModerationStatus" NOT NULL DEFAULT 'active',
    "userId" INTEGER NOT NULL,
    "reportId" INTEGER,
    "manualReason" TEXT,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appeal" (
    "id" SERIAL NOT NULL,
    "moderationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" VARCHAR NOT NULL,
    "status" "AppealStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "appeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");

-- CreateIndex
CREATE INDEX "timeSlot_huberId_updatedAt_idx" ON "timeSlot"("huberId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "notificationType_name_key" ON "notificationType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "chatType_name_key" ON "chatType"("name");

-- CreateIndex
CREATE INDEX "chat_recipientId_readAt_idx" ON "chat"("recipientId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "report_reporterId_reportedUserId_key" ON "report"("reporterId", "reportedUserId");

-- CreateIndex
CREATE INDEX "moderation_userId_idx" ON "moderation"("userId");

-- CreateIndex
CREATE INDEX "moderation_reportId_idx" ON "moderation"("reportId");

-- CreateIndex
CREATE INDEX "moderation_userId_actionType_status_idx" ON "moderation"("userId", "actionType", "status");

-- CreateIndex
CREATE INDEX "moderation_createdAt_idx" ON "moderation"("createdAt");

-- CreateIndex
CREATE INDEX "appeal_moderationId_idx" ON "appeal"("moderationId");

-- CreateIndex
CREATE INDEX "appeal_userId_idx" ON "appeal"("userId");

-- CreateIndex
CREATE INDEX "appeal_status_idx" ON "appeal"("status");

-- CreateIndex
CREATE INDEX "appeal_createdAt_idx" ON "appeal"("createdAt");

-- AddForeignKey
ALTER TABLE "humanBookTopic" ADD CONSTRAINT "fk_topics" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "humanBookTopic" ADD CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "liberTopicOfInterest" ADD CONSTRAINT "fk_topics" FOREIGN KEY ("topicId") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "liberTopicOfInterest" ADD CONSTRAINT "fk_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "humanBooks" ADD CONSTRAINT "fk_human_books_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_genderId_fkey" FOREIGN KEY ("genderId") REFERENCES "gender"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_photoId_fkey" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

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

-- AddForeignKey
ALTER TABLE "storyFavorite" ADD CONSTRAINT "storyFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storyFavorite" ADD CONSTRAINT "storyFavorite_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timeSlot" ADD CONSTRAINT "timeSlot_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readingSession" ADD CONSTRAINT "readingSession_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_feedbackById_fkey" FOREIGN KEY ("feedbackById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_feedbackToId_fkey" FOREIGN KEY ("feedbackToId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_readingSessionId_fkey" FOREIGN KEY ("readingSessionId") REFERENCES "readingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_readerId_fkey" FOREIGN KEY ("readerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "notificationType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sticker" ADD CONSTRAINT "sticker_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sticker" ADD CONSTRAINT "sticker_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_stickerId_fkey" FOREIGN KEY ("stickerId") REFERENCES "sticker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat" ADD CONSTRAINT "chat_chatTypeId_fkey" FOREIGN KEY ("chatTypeId") REFERENCES "chatType"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huberFavorite" ADD CONSTRAINT "huberFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huberFavorite" ADD CONSTRAINT "huberFavorite_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work" ADD CONSTRAINT "work_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "moderation" ADD CONSTRAINT "moderation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "moderation" ADD CONSTRAINT "moderation_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "report"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeal" ADD CONSTRAINT "appeal_moderationId_fkey" FOREIGN KEY ("moderationId") REFERENCES "moderation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appeal" ADD CONSTRAINT "appeal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
