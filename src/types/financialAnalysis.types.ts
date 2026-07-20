/**
 * Shared types for the Financial Analysis module.
 *
 * `FinancialAnalysisRecord` mirrors the Prisma `FinancialAnalysis` model
 * (see prisma/financial-analysis.prisma). Once you've merged that model
 * into your schema.prisma and run `npx prisma generate`, you can replace
 * this hand-written interface with the generated
 * `import { FinancialAnalysis } from '@prisma/client'` type if you prefer
 * — everything here is structurally compatible with it.
 */
export interface FinancialAnalysisRecord {
  id: string;
  companyId: string;

  // --- Revenue & Profitability ---
  revenue: number | null;
  revenueTarget: number | null;
  grossProfit: number | null;
  operatingProfit: number | null;
  netProfitBeforeTax: number | null;
  operatingExpenses: number | null;
  costOfGoodsSold: number | null;
  otherIncome: number | null;
  financeExpense: number | null;

  // --- Liquidity / Balance Sheet ---
  cashFlow: number | null;
  currentRatio: number | null;
  inventory: number | null;
  accountsReceivable: number | null;
  totalAssets: number | null;
  totalLiabilities: number | null;

  // --- Equity / Shares ---
  shareCapital: number | null;
  totalShares: number | null;
  sharesSold: number | null;
  sharesRemaining: number | null;

  // --- Funding ---
  fundingTarget: number | null;
  fundingRaised: number | null;
  investorCount: number | null;

  // --- Derived metrics (persisted for fast reads) ---
  profitMargin: number | null;
  revenueGrowth: number | null;

  // --- Period ---
  financialYear: number;
  month: number;

  createdAt: Date;
  updatedAt: Date;
}

/** Fields accepted from the client when creating/updating a period record. */
export interface FinancialAnalysisFields {
  revenue?: number;
  revenueTarget?: number;
  grossProfit?: number;
  operatingProfit?: number;
  netProfitBeforeTax?: number;
  operatingExpenses?: number;
  costOfGoodsSold?: number;
  otherIncome?: number;
  financeExpense?: number;

  cashFlow?: number;
  currentRatio?: number;
  inventory?: number;
  accountsReceivable?: number;
  totalAssets?: number;
  totalLiabilities?: number;

  shareCapital?: number;
  totalShares?: number;
  sharesSold?: number;

  fundingTarget?: number;
  fundingRaised?: number;
  investorCount?: number;
}

export interface FinancialAnalysisUpsertPayload extends FinancialAnalysisFields {
  companyId: string;
  financialYear: number;
  month: number;
}

/**
 * The subset of fields computeDerivedMetrics() reads from. Deliberately
 * loose (`number | null | undefined`) so it accepts both a freshly-validated
 * client payload (FinancialAnalysisFields, whose absent fields are
 * `undefined`) and a Prisma record (FinancialAnalysisRecord, whose absent
 * fields are `null`).
 */
export interface FinancialMetricsInput {
  revenue?: number | null;
  revenueTarget?: number | null;
  netProfitBeforeTax?: number | null;
  totalShares?: number | null;
  sharesSold?: number | null;
  fundingRaised?: number | null;
  fundingTarget?: number | null;
  totalLiabilities?: number | null;
  totalAssets?: number | null;
  currentRatio?: number | null;
}

/** Result of computeDerivedMetrics() — never persisted directly except the subset noted in the repo layer. */
export interface DerivedMetrics {
  revenueGrowth: number | null;
  profitMargin: number | null;
  sharesRemaining: number | null;
  sharesRemainingPercent: number | null;
  fundingProgress: number | null;
  targetAchievement: number | null;
  debtToAssetRatio: number | null;
  yoyRevenueGrowth: number | null;
  yoyProfitGrowth: number | null;
  financialHealthScore: number | null;
}

export interface FinancialHealthScoreInput {
  profitMargin: number | null;
  currentRatio: number | null | undefined;
  revenueGrowth: number | null;
  totalAssets: number | null | undefined;
  totalLiabilities: number | null | undefined;
  fundingRaised: number | null | undefined;
  fundingTarget: number | null | undefined;
}

/**
 * ASSUMPTIONS ABOUT YOUR EXISTING `CompanyProfile` MODEL — adjust to match
 * your real field names (see admin.repository.ts's COMPANY_SELECT).
 */
export interface CompanySummary {
  id: string;
  companyName: string;
  email: string;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: Date;
}

/** Frontend-ready shape produced by toFrontendShape(). */
export interface FinancialAnalysisFrontendShape {
  id: string;
  companyId: string;
  period: {
    financialYear: number;
    month: number;
    monthLabel: string;
    label: string;
  };
  revenue: {
    revenue: number | null;
    revenueTarget: number | null;
    targetAchievementPercent: number | null;
    growthPercent: number | null;
    yoyGrowthPercent: number | null;
  };
  profitability: {
    grossProfit: number | null;
    operatingProfit: number | null;
    netProfitBeforeTax: number | null;
    operatingExpenses: number | null;
    costOfGoodsSold: number | null;
    otherIncome: number | null;
    financeExpense: number | null;
    profitMarginPercent: number | null;
    yoyProfitGrowthPercent: number | null;
  };
  liquidity: {
    cashFlow: number | null;
    currentRatio: number | null;
    inventory: number | null;
    accountsReceivable: number | null;
    totalAssets: number | null;
    totalLiabilities: number | null;
    debtToAssetRatio: number | null;
  };
  equity: {
    shareCapital: number | null;
    totalShares: number | null;
    sharesSold: number | null;
    sharesRemaining: number | null;
    sharesRemainingPercent: number | null;
  };
  funding: {
    fundingTarget: number | null;
    fundingRaised: number | null;
    fundingProgressPercent: number | null;
    investorCount: number | null;
  };
  financialHealth: {
    score: number | null;
    label: string;
  };
  updatedAt: Date;
  createdAt: Date;
}

export type FundingStatus = 'NO_DATA' | 'FULLY_FUNDED' | 'ON_TRACK' | 'EARLY_STAGE' | 'NOT_STARTED';

export interface AdminCompanyListItem {
  id: string;
  companyName: string;
  email: string;
  verificationStatus: string;
  createdAt: Date;
  fundingStatus: FundingStatus;
  fundingProgressPercent: number | null;
  financialHealthScore: number | null;
  financialHealthLabel: string;
  latestPeriod: string | null;
  fundingRaised: number | null;
  fundingTarget: number | null;
  investorCount: number | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminCompaniesListResult {
  companies: AdminCompanyListItem[];
  pagination: PaginationMeta;
}

export interface AdminCompanyDetailResult {
  company: {
    id: string;
    companyName: string;
    email: string;
    verificationStatus: string;
    createdAt: Date;
        informationMemo?: unknown; // ← new
  };
  financial: FinancialAnalysisFrontendShape | null;
  fundingStatus: FundingStatus;
}

export interface ChartTrendPoint {
  label: string;
  value: number | null;
}

export interface DashboardResult {
  companyId: string;
  kpis: {
    revenue: number | null;
    revenueGrowthPercent: number | null;
    profitMarginPercent: number | null;
    netProfitBeforeTax: number | null;
    cashFlow: number | null;
    targetAchievementPercent: number | null;
    fundingProgressPercent: number | null;
    sharesRemainingPercent: number | null;
    financialHealthScore: number | null;
    financialHealthLabel: string;
  };
  current: FinancialAnalysisFrontendShape | null;
  charts: {
    revenueTrend: ChartTrendPoint[];
    profitTrend: ChartTrendPoint[];
    cashFlowTrend: ChartTrendPoint[];
  };
}

export interface CompanyChartsResult {
  companyId: string;
  periods: string[];
  revenue: { labels: string[]; actual: (number | null)[]; target: (number | null)[] };
  profit: {
    labels: string[];
    grossProfit: (number | null)[];
    operatingProfit: (number | null)[];
    netProfitBeforeTax: (number | null)[];
  };
  cashFlow: { labels: string[]; values: (number | null)[] };
  funding: {
    labels: string[];
    raised: (number | null)[];
    target: (number | null)[];
    investorCount: (number | null)[];
  };
  shares: {
    labels: string[];
    sold: (number | null)[];
    remaining: (number | null)[];
    total: (number | null)[];
  };
}

export interface ListCompaniesQuery {
  page: number;
  limit: number;
  verificationStatus?: string;
  search?: string;
}
