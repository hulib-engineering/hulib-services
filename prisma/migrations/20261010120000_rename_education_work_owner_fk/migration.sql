-- Rename the owner foreign key on education/work from "huberId" to "userId".
-- The column itself keeps its name via @map("huberId"), so this is metadata only.
ALTER TABLE "education" DROP CONSTRAINT "education_huberId_fkey";
ALTER TABLE "education" ADD CONSTRAINT "education_userId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "work" DROP CONSTRAINT "work_huberId_fkey";
ALTER TABLE "work" ADD CONSTRAINT "work_userId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;