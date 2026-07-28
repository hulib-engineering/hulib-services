-- CreateEnum
CREATE TYPE "EducationType" AS ENUM ('vocational', 'university', 'life_experience');

-- AlterTable
ALTER TABLE "education"
ADD COLUMN "type" "EducationType",
ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
