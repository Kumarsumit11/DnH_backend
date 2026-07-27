/*
  Warnings:

  - A unique constraint covering the columns `[actionToken]` on the table `Consultation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Consultation" ADD COLUMN     "actionToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Consultation_actionToken_key" ON "Consultation"("actionToken");
