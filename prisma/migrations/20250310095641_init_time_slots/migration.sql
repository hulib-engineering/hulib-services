-- CreateTable
CREATE TABLE "timeSlot" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userTimeSlot" (
    "userId" INTEGER NOT NULL,
    "timeSlotId" INTEGER NOT NULL,

    CONSTRAINT "userTimeSlot_pkey" PRIMARY KEY ("userId","timeSlotId")
);

-- CreateIndex
CREATE UNIQUE INDEX "timeSlot_dayOfWeek_startTime_key" ON "timeSlot"("dayOfWeek", "startTime");

-- AddForeignKey
ALTER TABLE "userTimeSlot" ADD CONSTRAINT "userTimeSlot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userTimeSlot" ADD CONSTRAINT "userTimeSlot_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "timeSlot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
