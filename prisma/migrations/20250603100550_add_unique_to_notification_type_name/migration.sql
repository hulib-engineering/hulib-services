/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `notificationType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "notificationType_name_key" ON "notificationType"("name");
