/**
 * Pure calculation helpers for the Financial Analysis module.
 * No I/O, no Prisma — easy to unit test in isolation.
 * Every calculator returns `null` (not 0, not NaN) when it can't be
 * computed, so the frontend can render "N/A" instead of a misleading 0%.
 */
import type {
  DerivedMetrics,
  FinancialHealthScoreInput,
  FinancialAnalysisRecord,
  FinancialMetricsInput,
} from '../types/financialAnalysis.types';

export const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

export const isNum = (v: unknown): v is number =>
  typeof v === 'number' && !Number.isNaN(v) && Number.isFinite(v);

/** Percentage growth between a previous and current value. */
export function calcGrowthPercent(
  current: number | null | undefined,
  previous: number | null | undefined
): number | null {
  if (!isNum(current) || !isNum(previous) || previous === 0) return null;
  return round2(((current - previous) / Math.abs(previous)) * 100);
}

/** Revenue growth % — thin wrapper for readability at call sites. */
export function calcRevenueGrowth(
  currentRevenue: number | null | undefined,
  previousRevenue: number | null | undefined
): number | null {
  return calcGrowthPercent(currentRevenue, previousRevenue);
}

/** Year-over-year growth for any metric (revenue, profit, cashflow, etc). */
export function calcYoYGrowth(
  currentYearValue: number | null | undefined,
  previousYearValue: number | null | undefined
): number | null {
  return calcGrowthPercent(currentYearValue, previousYearValue);
}

/** Net profit margin % = netProfitBeforeTax / revenue * 100 */
export function calcProfitMargin(
  netProfitBeforeTax: number | null | undefined,
  revenue: number | null | undefined
): number | null {
  if (!isNum(netProfitBeforeTax) || !isNum(revenue) || revenue === 0) return null;
  return round2((netProfitBeforeTax / revenue) * 100);
}

/** Funding progress % = fundingRaised / fundingTarget * 100 (not capped — overachievement is valid). */
export function calcFundingProgress(
  fundingRaised: number | null | undefined,
  fundingTarget: number | null | undefined
): number | null {
  if (!isNum(fundingRaised) || !isNum(fundingTarget) || fundingTarget === 0) return null;
  return round2((fundingRaised / fundingTarget) * 100);
}

/** Shares remaining = totalShares - sharesSold (clamped to >= 0). */
export function calcSharesRemaining(
  totalShares: number | null | undefined,
  sharesSold: number | null | undefined
): number | null {
  if (!isNum(totalShares) || !isNum(sharesSold)) return null;
  return Math.max(totalShares - sharesSold, 0);
}

/** Shares remaining as a % of total shares. */
export function calcSharesRemainingPercent(
  totalShares: number | null | undefined,
  sharesRemaining: number | null | undefined
): number | null {
  if (!isNum(totalShares) || !isNum(sharesRemaining) || totalShares === 0) return null;
  return round2((sharesRemaining / totalShares) * 100);
}

/** Target achievement % = revenue / revenueTarget * 100 */
export function calcTargetAchievement(
  revenue: number | null | undefined,
  revenueTarget: number | null | undefined
): number | null {
  if (!isNum(revenue) || !isNum(revenueTarget) || revenueTarget === 0) return null;
  return round2((revenue / revenueTarget) * 100);
}

/** Debt-to-asset ratio = totalLiabilities / totalAssets */
export function calcDebtToAssetRatio(
  totalLiabilities: number | null | undefined,
  totalAssets: number | null | undefined
): number | null {
  if (!isNum(totalLiabilities) || !isNum(totalAssets) || totalAssets === 0) return null;
  return round2(totalLiabilities / totalAssets);
}

const clamp = (n: number, min: number, max: number): number => Math.min(Math.max(n, min), max);

/** Linear interpolation of a value between [inMin, inMax] onto [outMin, outMax], clamped. */
export function scaleLinear(
  value: number | null | undefined,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number | null {
  if (!isNum(value)) return null;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

/**
 * Financial Health Score (0-100).
 *
 * Weighted composite across five dimensions. Any dimension whose inputs are
 * missing is simply excluded and the remaining points are re-based to 100,
 * so a company with partial data still gets a fair, comparable score
 * instead of being penalized for missing fields.
 *
 *   Profitability (profit margin)      — 25 pts  (0% -> 0pts, 20%+ -> 25pts)
 *   Liquidity (current ratio)          — 20 pts  (0 -> 0pts, 2.0+ -> 20pts)
 *   Growth (revenue growth %)          — 20 pts  (-20% -> 0pts, +30%+ -> 20pts)
 *   Leverage (debt-to-asset, inverse)  — 20 pts  (1.0+ -> 0pts, 0 -> 20pts)
 *   Funding progress                   — 15 pts  (0% -> 0pts, 100%+ -> 15pts)
 */
export function calcFinancialHealthScore({
  profitMargin,
  currentRatio,
  revenueGrowth,
  totalAssets,
  totalLiabilities,
  fundingRaised,
  fundingTarget,
}: FinancialHealthScoreInput): number | null {
  const dimensions: { points: number | null; max: number }[] = [];

  if (isNum(profitMargin)) {
    dimensions.push({ points: scaleLinear(profitMargin, 0, 20, 0, 25), max: 25 });
  }
  if (isNum(currentRatio)) {
    dimensions.push({ points: scaleLinear(currentRatio, 0, 2, 0, 20), max: 20 });
  }
  if (isNum(revenueGrowth)) {
    dimensions.push({ points: scaleLinear(revenueGrowth, -20, 30, 0, 20), max: 20 });
  }
  const debtRatio = calcDebtToAssetRatio(totalLiabilities, totalAssets);
  if (isNum(debtRatio)) {
    dimensions.push({ points: scaleLinear(debtRatio, 0, 1, 20, 0), max: 20 });
  }
  const fundingProgress = calcFundingProgress(fundingRaised, fundingTarget);
  if (isNum(fundingProgress)) {
    dimensions.push({ points: scaleLinear(fundingProgress, 0, 100, 0, 15), max: 15 });
  }

  if (dimensions.length === 0) return null;

  const earned = dimensions.reduce((sum, d) => sum + (d.points ?? 0), 0);
  const possible = dimensions.reduce((sum, d) => sum + d.max, 0);

  return Math.round((earned / possible) * 100);
}

export function healthScoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return 'Insufficient Data';
  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Weak';
  return 'Critical';
}

/**
 * Computes every derived metric for a single financial analysis record
 * given (optionally) the prior-period record for growth comparisons.
 */
export function computeDerivedMetrics(
  current: FinancialMetricsInput,
  previousPeriod: FinancialAnalysisRecord | null = null,
  sameMonthLastYear: FinancialAnalysisRecord | null = null
): DerivedMetrics {
  const revenueGrowth = previousPeriod
    ? calcRevenueGrowth(current.revenue, previousPeriod.revenue)
    : null;

  const profitMargin = calcProfitMargin(current.netProfitBeforeTax, current.revenue);
  const sharesRemaining = calcSharesRemaining(current.totalShares, current.sharesSold);

  return {
    revenueGrowth,
    profitMargin,
    sharesRemaining,
    sharesRemainingPercent: calcSharesRemainingPercent(current.totalShares, sharesRemaining),
    fundingProgress: calcFundingProgress(current.fundingRaised, current.fundingTarget),
    targetAchievement: calcTargetAchievement(current.revenue, current.revenueTarget),
    debtToAssetRatio: calcDebtToAssetRatio(current.totalLiabilities, current.totalAssets),
    yoyRevenueGrowth: sameMonthLastYear
      ? calcYoYGrowth(current.revenue, sameMonthLastYear.revenue)
      : null,
    yoyProfitGrowth: sameMonthLastYear
      ? calcYoYGrowth(current.netProfitBeforeTax, sameMonthLastYear.netProfitBeforeTax)
      : null,
    financialHealthScore: calcFinancialHealthScore({
      profitMargin,
      currentRatio: current.currentRatio,
      revenueGrowth,
      totalAssets: current.totalAssets,
      totalLiabilities: current.totalLiabilities,
      fundingRaised: current.fundingRaised,
      fundingTarget: current.fundingTarget,
    }),
  };
}
