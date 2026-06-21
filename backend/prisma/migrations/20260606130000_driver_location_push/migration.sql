-- AlterTable
ALTER TABLE "User" ADD COLUMN "pushToken" TEXT;
ALTER TABLE "User" ADD COLUMN "pushPlatform" TEXT;

-- AlterTable
ALTER TABLE "DriverProfile" ADD COLUMN "lastLat" DOUBLE PRECISION;
ALTER TABLE "DriverProfile" ADD COLUMN "lastLng" DOUBLE PRECISION;
ALTER TABLE "DriverProfile" ADD COLUMN "lastLocationAt" TIMESTAMP(3);
