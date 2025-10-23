-- AlterTable
ALTER TABLE "user" ADD COLUMN     "coverImageId" UUID;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
