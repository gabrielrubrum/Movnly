-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "passengerId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "pickupTime" DATETIME NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'smart',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price" REAL,
    "paymentIntentId" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "platformFee" REAL,
    "driverAmount" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("createdAt", "driverAmount", "from", "id", "passengerId", "paymentIntentId", "paymentStatus", "pickupTime", "platformFee", "price", "status", "to", "updatedAt") SELECT "createdAt", "driverAmount", "from", "id", "passengerId", "paymentIntentId", "paymentStatus", "pickupTime", "platformFee", "price", "status", "to", "updatedAt" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_paymentIntentId_key" ON "Booking"("paymentIntentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
