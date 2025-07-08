/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `topics` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "topics_name_key" ON "topics"("name");
