import { financialAnalysisRepository } from '../repositories/financialAnalysis.repository';
import { NotFoundError } from '../utils/errors';
import { computeDerivedMetrics, healthScoreLabel } from '../utils/financialCalculations';
import type {
  DerivedMetrics,
  FinancialAnalysisRecord,
  FinancialAnalysisFrontendShape,
  FinancialAnalysisUpsertPayload,
  DashboardResult,
  CompanyChartsResult,
} from '../types/financialAnalysis.types';

export const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/** Shapes a raw Prisma record + its derived metrics into frontend-ready JSON. */
export function toFrontendShape(
  record: FinancialAnalysisRecord | null,
  derived: Partial<DerivedMetrics> = {}
): FinancialAnalysisFrontendShape | null {
  if (!record) return null;
  return {
    id: record.id,
    companyId: record.companyId,
    period: {
      financialYear: record.financialYear,
      month: record.month,
      monthLabel: MONTH_NAMES[record.month - 1],
      label: `${MONTH_NAMES[record.month - 1]} ${record.financialYear}`,
    },
    revenue: {
      revenue: record.revenue,
      revenueTarget: record.revenueTarget,
      targetAchievementPercent: derived.targetAchievement ?? null,
      growthPercent: derived.revenueGrowth ?? null,
      yoyGrowthPercent: derived.yoyRevenueGrowth ?? null,
    },
    profitability: {
      grossProfit: record.grossProfit,
      operatingProfit: record.operatingProfit,
      netProfitBeforeTax: record.netProfitBeforeTax,
      operatingExpenses: record.operatingExpenses,
      costOfGoodsSold: record.costOfGoodsSold,
      otherIncome: record.otherIncome,
      financeExpense: record.financeExpense,
      profitMarginPercent: derived.profitMargin ?? null,
      yoyProfitGrowthPercent: derived.yoyProfitGrowth ?? null,
    },
    liquidity: {
      cashFlow: record.cashFlow,
      currentRatio: record.currentRatio,
      inventory: record.inventory,
      accountsReceivable: record.accountsReceivable,
      totalAssets: record.totalAssets,
      totalLiabilities: record.totalLiabilities,
      debtToAssetRatio: derived.debtToAssetRatio ?? null,
    },
    equity: {
      shareCapital: record.shareCapital,
      totalShares: record.totalShares,
      sharesSold: record.sharesSold,
      sharesRemaining: derived.sharesRemaining ?? record.sharesRemaining ?? null,
      sharesRemainingPercent: derived.sharesRemainingPercent ?? null,
    },
    funding: {
      fundingTarget: record.fundingTarget,
      fundingRaised: record.fundingRaised,
      fundingProgressPercent: derived.fundingProgress ?? null,
      investorCount: record.investorCount,
    },
    financialHealth: {
      score: derived.financialHealthScore ?? null,
      label: healthScoreLabel(derived.financialHealthScore ?? null),
    },
    updatedAt: record.updatedAt,
    createdAt: record.createdAt,
  };
}

export const financialAnalysisService = {
  /**
   * Create or update the financial analysis for a company + period.
   * Recalculates all derived metrics against the new numbers before saving,
   * so profitMargin / revenueGrowth / sharesRemaining are always in sync.
   */
  async upsert(payload: FinancialAnalysisUpsertPayload): Promise<FinancialAnalysisFrontendShape | null> {
    const { companyId, financialYear, month, ...fields } = payload;

    const [previousPeriod, sameMonthLastYear] = await Promise.all([
      financialAnalysisRepository.findPreviousPeriod(companyId, financialYear, month),
      financialAnalysisRepository.findSameMonthLastYear(companyId, financialYear, month),
    ]);

    const derived = computeDerivedMetrics(fields, previousPeriod, sameMonthLastYear);

    const record = await financialAnalysisRepository.upsert(companyId, financialYear, month, {
      ...fields,
      profitMargin: derived.profitMargin,
      revenueGrowth: derived.revenueGrowth,
      sharesRemaining: derived.sharesRemaining,
    });

    return toFrontendShape(record, derived);
  },

  /** Complete financial analysis for a company (latest period). */
  async getByCompanyId(companyId: string): Promise<FinancialAnalysisFrontendShape | null> {
    const record = await financialAnalysisRepository.findLatestByCompanyId(companyId);
    if (!record) {
      throw new NotFoundError('No financial analysis found for this company');
    }

    const [previousPeriod, sameMonthLastYear] = await Promise.all([
      financialAnalysisRepository.findPreviousPeriod(companyId, record.financialYear, record.month),
      financialAnalysisRepository.findSameMonthLastYear(companyId, record.financialYear, record.month),
    ]);

    const derived = computeDerivedMetrics(record, previousPeriod, sameMonthLastYear);
    return toFrontendShape(record, derived);
  },

  /** Dashboard: current KPIs + calculated metrics + light chart-ready trend. */
  async getDashboard(companyId: string): Promise<DashboardResult> {
    const records = await financialAnalysisRepository.findAllByCompanyId(companyId, 13);
    if (!records || records.length === 0) {
      throw new NotFoundError('No financial analysis found for this company');
    }

    const latest = records[0];
    const previousPeriod = records[1] || null;
    const sameMonthLastYear = await financialAnalysisRepository.findSameMonthLastYear(
      companyId,
      latest.financialYear,
      latest.month
    );

    const derived = computeDerivedMetrics(latest, previousPeriod, sameMonthLastYear);
    const current = toFrontendShape(latest, derived);

    const trend = records
      .slice()
      .reverse()
      .map((r) => ({
        label: `${MONTH_NAMES[r.month - 1]} ${r.financialYear}`,
        revenue: r.revenue,
        netProfitBeforeTax: r.netProfitBeforeTax,
        cashFlow: r.cashFlow,
      }));

    return {
      companyId,
      kpis: {
        revenue: latest.revenue,
        revenueGrowthPercent: derived.revenueGrowth,
        profitMarginPercent: derived.profitMargin,
        netProfitBeforeTax: latest.netProfitBeforeTax,
        cashFlow: latest.cashFlow,
        targetAchievementPercent: derived.targetAchievement,
        fundingProgressPercent: derived.fundingProgress,
        sharesRemainingPercent: derived.sharesRemainingPercent,
        financialHealthScore: derived.financialHealthScore,
        financialHealthLabel: healthScoreLabel(derived.financialHealthScore),
      },
      current,
      charts: {
        revenueTrend: trend.map((t) => ({ label: t.label, value: t.revenue })),
        profitTrend: trend.map((t) => ({ label: t.label, value: t.netProfitBeforeTax })),
        cashFlowTrend: trend.map((t) => ({ label: t.label, value: t.cashFlow })),
      },
    };
  },

  /** Detailed multi-series chart data for the admin company view. */
  async getCompanyCharts(companyId: string, monthsBack = 12): Promise<CompanyChartsResult> {
    const records = await financialAnalysisRepository.findRecentPeriods(companyId, monthsBack);
    if (!records || records.length === 0) {
      throw new NotFoundError('No financial analysis found for this company');
    }

    const labels = records.map((r) => `${MONTH_NAMES[r.month - 1]} ${r.financialYear}`);

    return {
      companyId,
      periods: labels,
      revenue: {
        labels,
        actual: records.map((r) => r.revenue),
        target: records.map((r) => r.revenueTarget),
      },
      profit: {
        labels,
        grossProfit: records.map((r) => r.grossProfit),
        operatingProfit: records.map((r) => r.operatingProfit),
        netProfitBeforeTax: records.map((r) => r.netProfitBeforeTax),
      },
      cashFlow: {
        labels,
        values: records.map((r) => r.cashFlow),
      },
      funding: {
        labels,
        raised: records.map((r) => r.fundingRaised),
        target: records.map((r) => r.fundingTarget),
        investorCount: records.map((r) => r.investorCount),
      },
      shares: {
        labels,
        sold: records.map((r) => r.sharesSold),
        remaining: records.map((r) => r.sharesRemaining),
        total: records.map((r) => r.totalShares),
      },
    };
  },
};
