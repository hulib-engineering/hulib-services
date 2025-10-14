-- CreateTable
CREATE TABLE "huberFavorite" (
    "userId" INTEGER NOT NULL,
    "huberId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "huberFavorite_pkey" PRIMARY KEY ("userId","huberId")
);

-- AddForeignKey
ALTER TABLE "huberFavorite" ADD CONSTRAINT "huberFavorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "huberFavorite" ADD CONSTRAINT "huberFavorite_huberId_fkey" FOREIGN KEY ("huberId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
