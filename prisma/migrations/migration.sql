-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "durationMin" INTEGER NOT NULL,
    "price" DOUBLE PRECISION,
    "clinicId" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Slot" ADD COLUMN     "serviceId" TEXT;

-- Update existing slots with a default serviceId if necessary (adjust as needed)
-- This step is commented out as we are clearing the table in the seed script
-- UPDATE "Slot" SET "serviceId" = 'some_default_service_id' WHERE "serviceId" IS NULL;

-- Make the serviceId column required
ALTER TABLE "Slot" ALTER COLUMN "serviceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
