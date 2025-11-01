-- AlterTable
ALTER TABLE "report"
    ADD COLUMN     "customReason" TEXT,
    ADD COLUMN     "rejectedCustomReason" TEXT,
    ADD COLUMN     "rejectedReason" TEXT;
