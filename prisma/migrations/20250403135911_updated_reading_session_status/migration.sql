-- Add new values to existing enum
ALTER TYPE "ReadingSessionStatus" ADD VALUE IF NOT EXISTS 'pending';
ALTER TYPE "ReadingSessionStatus" ADD VALUE IF NOT EXISTS 'rejected';
ALTER TYPE "ReadingSessionStatus" ADD VALUE IF NOT EXISTS 'approved';