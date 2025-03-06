-- CreateTable
CREATE TABLE "schedules" (
    "schedulesId" SERIAL NOT NULL,
    "humanBookId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startTime" TIME(6) NOT NULL,
    "endedAt" TIMESTAMP(6) NOT NULL,
    "endTime" TIME(6) NOT NULL,
    "isBooked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("schedulesId")
);

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_humanBookId_fkey" FOREIGN KEY ("humanBookId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
