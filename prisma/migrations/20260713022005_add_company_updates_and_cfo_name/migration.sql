-- CreateEnum
CREATE TYPE "UpdateAuthorRole" AS ENUM ('CEO', 'CFO');

-- CreateEnum
CREATE TYPE "UpdateCategory" AS ENUM ('GENERAL', 'FINANCIAL', 'PRODUCT', 'MILESTONE', 'RISK');

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "ceoName" TEXT,
ADD COLUMN     "cfoName" TEXT,
ADD COLUMN     "gstin" TEXT,
ADD COLUMN     "monthlyRevenue" DECIMAL(18,2),
ADD COLUMN     "yearlyRevenue" DECIMAL(18,2);

-- CreateTable
CREATE TABLE "CompanyUpdate" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "authorRole" "UpdateAuthorRole" NOT NULL,
    "authorName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "UpdateCategory" NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CompanyUpdate_companyId_idx" ON "CompanyUpdate"("companyId");

-- CreateIndex
CREATE INDEX "CompanyUpdate_companyId_createdAt_idx" ON "CompanyUpdate"("companyId", "createdAt");

-- AddForeignKey
ALTER TABLE "CompanyUpdate" ADD CONSTRAINT "CompanyUpdate_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
