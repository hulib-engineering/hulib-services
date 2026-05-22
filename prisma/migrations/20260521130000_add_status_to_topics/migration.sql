-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('active', 'inactive');

-- AlterTable: existing rows become active; new app creates default to inactive
ALTER TABLE "topics" ADD COLUMN "status" "TopicStatus" NOT NULL DEFAULT 'active';
