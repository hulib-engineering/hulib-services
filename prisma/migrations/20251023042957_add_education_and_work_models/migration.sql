-- CreateTable
CREATE TABLE "education" (
    "id" SERIAL NOT NULL,
    "major" VARCHAR NOT NULL,
    "institution" VARCHAR NOT NULL,
    "startedAt" DATE NOT NULL,
    "endedAt" DATE,
    "huberId" INTEGER NOT NULL,
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

-- AddForeignKey
ALTER TABLE "education" ADD CONSTRAINT "education_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "work" ADD CONSTRAINT "work_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
