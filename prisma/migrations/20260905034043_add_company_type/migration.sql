-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('REAL_ESTATE', 'TECHNOLOGY', 'MANUFACTURING', 'HEALTHCARE', 'FINANCE', 'OTHER');

-- AlterTable
ALTER TABLE "CompanyProfile" ADD COLUMN     "companyType" "CompanyType";
