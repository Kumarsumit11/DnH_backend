-- AlterTable
ALTER TABLE "FundingOpportunity" ADD COLUMN     "pricePerShare" DECIMAL(18,2),
ADD COLUMN     "totalShares" INTEGER;

-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "shares" INTEGER;

-- AlterTable
ALTER TABLE "InvestmentProposal" ADD COLUMN     "sharesRequested" INTEGER;

-- CreateTable
CREATE TABLE "FinancialAnalysis" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "revenue" DOUBLE PRECISION,
    "revenueTarget" DOUBLE PRECISION,
    "grossProfit" DOUBLE PRECISION,
    "operatingProfit" DOUBLE PRECISION,
    "netProfitBeforeTax" DOUBLE PRECISION,
    "operatingExpenses" DOUBLE PRECISION,
    "costOfGoodsSold" DOUBLE PRECISION,
    "otherIncome" DOUBLE PRECISION,
    "financeExpense" DOUBLE PRECISION,
    "cashFlow" DOUBLE PRECISION,
    "currentRatio" DOUBLE PRECISION,
    "inventory" DOUBLE PRECISION,
    "accountsReceivable" DOUBLE PRECISION,
    "totalAssets" DOUBLE PRECISION,
    "totalLiabilities" DOUBLE PRECISION,
    "shareCapital" DOUBLE PRECISION,
    "totalShares" INTEGER,
    "sharesSold" INTEGER,
    "sharesRemaining" INTEGER,
    "fundingTarget" DOUBLE PRECISION,
    "fundingRaised" DOUBLE PRECISION,
    "investorCount" INTEGER,
    "profitMargin" DOUBLE PRECISION,
    "revenueGrowth" DOUBLE PRECISION,
    "financialYear" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialAnalysis_companyId_idx" ON "FinancialAnalysis"("companyId");

-- CreateIndex
CREATE INDEX "FinancialAnalysis_companyId_financialYear_idx" ON "FinancialAnalysis"("companyId", "financialYear");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialAnalysis_companyId_financialYear_month_key" ON "FinancialAnalysis"("companyId", "financialYear", "month");

-- AddForeignKey
ALTER TABLE "FinancialAnalysis" ADD CONSTRAINT "FinancialAnalysis_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "CompanyProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
