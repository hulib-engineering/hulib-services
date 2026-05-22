-- CreateEnum
CREATE TYPE "TopicColor" AS ENUM ('yellow', 'orange', 'pink', 'lavender', 'green', 'blue', 'primary');

-- AlterTable
ALTER TABLE "topics" ADD COLUMN "color" "TopicColor" NOT NULL DEFAULT 'primary';
