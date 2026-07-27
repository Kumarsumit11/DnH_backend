-- CreateEnum
CREATE TYPE "DashboardScope" AS ENUM ('CEO', 'CFO', 'BOTH');

-- CreateEnum
CREATE TYPE "DataTypeEnum" AS ENUM ('CURRENCY', 'PERCENT', 'DAYS', 'COUNT', 'RATIO');

-- CreateEnum
CREATE TYPE "CalculationType" AS ENUM ('SUM', 'AVERAGE', 'LAST_VALUE');

-- CreateEnum
CREATE TYPE "ValueType" AS ENUM ('ACTUAL', 'TARGET', 'LAST_YEAR');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('DRAFT', 'SUBMITTED');

-- CreateEnum
CREATE TYPE "MonthEnum" AS ENUM ('JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC');

-- CreateTable
CREATE TABLE "FiscalYearConfig" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "fiscalYearLabel" TEXT NOT NULL,
    "startMonth" "MonthEnum" NOT NULL,
    "targetGreenThreshold" DECIMAL(5,4) NOT NULL DEFAULT 1.00,
    "targetAmberThreshold" DECIMAL(5,4) NOT NULL DEFAULT 0.90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FiscalYearConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorDefinition" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "dashboardScope" "DashboardScope" NOT NULL,
    "dataType" "DataTypeEnum" NOT NULL,
    "calculationType" "CalculationType" NOT NULL DEFAULT 'SUM',
    "hasTarget" BOOLEAN NOT NULL DEFAULT false,
    "hasLastYear" BOOLEAN NOT NULL DEFAULT false,
    "isFormula" BOOLEAN NOT NULL DEFAULT false,
    "formulaKey" TEXT,
    "allowNegative" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "IndicatorDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "fiscalYearConfigId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlySubmission" (
    "id" TEXT NOT NULL,
    "fiscalYearConfigId" TEXT NOT NULL,
    "month" "MonthEnum" NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "submittedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndicatorValue" (
    "id" TEXT NOT NULL,
    "monthlySubmissionId" TEXT NOT NULL,
    "indicatorDefinitionId" TEXT NOT NULL,
    "productId" TEXT,
    "valueType" "ValueType" NOT NULL,
    "value" DECIMAL(18,4) NOT NULL,

    CONSTRAINT "IndicatorValue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FiscalYearConfig_companyId_fiscalYearLabel_key" ON "FiscalYearConfig"("companyId", "fiscalYearLabel");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorDefinition_code_key" ON "IndicatorDefinition"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Product_fiscalYearConfigId_slot_key" ON "Product"("fiscalYearConfigId", "slot");

-- CreateIndex
CREATE INDEX "MonthlySubmission_fiscalYearConfigId_idx" ON "MonthlySubmission"("fiscalYearConfigId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlySubmission_fiscalYearConfigId_month_key" ON "MonthlySubmission"("fiscalYearConfigId", "month");

-- CreateIndex
CREATE INDEX "IndicatorValue_monthlySubmissionId_idx" ON "IndicatorValue"("monthlySubmissionId");

-- CreateIndex
CREATE UNIQUE INDEX "IndicatorValue_monthlySubmissionId_indicatorDefinitionId_pr_key" ON "IndicatorValue"("monthlySubmissionId", "indicatorDefinitionId", "productId", "valueType");

-- AddForeignKey
ALTER TABLE "FiscalYearConfig" ADD CONSTRAINT "FiscalYearConfig_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_fiscalYearConfigId_fkey" FOREIGN KEY ("fiscalYearConfigId") REFERENCES "FiscalYearConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySubmission" ADD CONSTRAINT "MonthlySubmission_fiscalYearConfigId_fkey" FOREIGN KEY ("fiscalYearConfigId") REFERENCES "FiscalYearConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlySubmission" ADD CONSTRAINT "MonthlySubmission_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorValue" ADD CONSTRAINT "IndicatorValue_monthlySubmissionId_fkey" FOREIGN KEY ("monthlySubmissionId") REFERENCES "MonthlySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorValue" ADD CONSTRAINT "IndicatorValue_indicatorDefinitionId_fkey" FOREIGN KEY ("indicatorDefinitionId") REFERENCES "IndicatorDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndicatorValue" ADD CONSTRAINT "IndicatorValue_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
