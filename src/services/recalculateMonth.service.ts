import * as calc from './calculation.service';
import type { ProductAmount } from './calculation.service';
import type { FieldMessage } from '../types/tally';

export interface RangeValues {
  actual?: number;
  target?: number;
  lastYear?: number;
}

export interface AgingBuckets {
  lt30?: number;
  lt60?: number;
  lt90?: number;
  gt90?: number;
}

/**
 * Input shape expected by recalculateMonth().
 *
 *   products: up to 5 rows (CEO only)
 *   headcountMale / headcountFemale: CEO only
 *   accountsPayable / apAging / fixedAssets.. / equity: CFO only
 */
export interface RawCalcInput {
  revenue?: RangeValues;
  cogs?: RangeValues;
  opex?: RangeValues;
  nonOpIncome?: RangeValues;
  financeExpense?: RangeValues;
  previousMonthRevenueActual?: number;
  products?: ProductAmount[];
  headcountMale?: number;
  headcountFemale?: number;
  accountsReceivable?: number;
  overdueAr?: number;
  arAging?: AgingBuckets;
  accountsPayable?: number;
  apAging?: AgingBuckets;
  fixedAssets?: number;
  currentAssets?: number;
  otherAssets?: number;
  currentLiabilities?: number;
  longTermLiabilities?: number;
  equity?: number;
}

/** Every FORMULA-type indicator value for the month, keyed by result name. */
export type RecalcResults = Record<string, number>;

export interface RecalcOutput {
  results: RecalcResults;
  warnings: FieldMessage[];
}

const VALUE_TYPES = ['actual', 'target', 'lastYear'] as const;

/**
 * recalculateMonth(raw)
 *
 * Returns every FORMULA-type indicator value for the month, plus the
 * reconciliation deltas the form should show as warnings (never persisted).
 */
export function recalculateMonth(raw: RawCalcInput): RecalcOutput {
  const results: RecalcResults = {};
  const warnings: FieldMessage[] = [];

  // --- P&L waterfall -------------------------------------------------------
  VALUE_TYPES.forEach((vt) => {
    const revenue = raw.revenue?.[vt] ?? 0;
    const cogs = raw.cogs?.[vt] ?? 0;
    const opex = raw.opex?.[vt] ?? 0;
    const nonOp = raw.nonOpIncome?.[vt] ?? 0;
    const financeExp = raw.financeExpense?.[vt] ?? 0;

    const gp = calc.grossProfit(revenue, cogs);
    const ebitVal = calc.ebit(gp, opex);
    const npbt = calc.netProfitBeforeTax(ebitVal, nonOp, financeExp);
    const margin = calc.netProfitMargin(npbt, revenue);

    results[`grossProfit_${vt}`] = gp;
    results[`ebit_${vt}`] = ebitVal;
    results[`netProfitBeforeTax_${vt}`] = npbt;
    results[`netProfitMargin_${vt}`] = margin;
  });

  // --- Sales growth (Actual only, month-over-month — needs prior month) ----
  if (raw.previousMonthRevenueActual !== undefined) {
    results.salesGrowth = calc.salesGrowth(raw.revenue?.actual ?? 0, raw.previousMonthRevenueActual);
  }

  // --- Products (CEO only) --------------------------------------------------
  if (Array.isArray(raw.products) && raw.products.length) {
    const totalActual = calc.sumProducts(raw.products, 'actual');
    const totalTarget = calc.sumProducts(raw.products, 'target');
    results.totalSalesByProduct_actual = totalActual;
    results.totalSalesByProduct_target = totalTarget;

    const productDeltaActual = calc.productReconciliationDelta(totalActual, raw.revenue?.actual ?? 0);
    const productDeltaTarget = calc.productReconciliationDelta(totalTarget, raw.revenue?.target ?? 0);
    if (productDeltaActual !== 0) {
      warnings.push({
        field: 'totalSalesByProduct_actual',
        message: `Total Sales by Product differs from Revenue (Actual) by ${productDeltaActual}`,
      });
    }
    if (productDeltaTarget !== 0) {
      warnings.push({
        field: 'totalSalesByProduct_target',
        message: `Total Sales by Product differs from Revenue (Target) by ${productDeltaTarget}`,
      });
    }
  }

  // --- Headcount (CEO only) -------------------------------------------------
  if (raw.headcountMale !== undefined || raw.headcountFemale !== undefined) {
    results.headcountTotal = calc.headcountTotal(raw.headcountMale ?? 0, raw.headcountFemale ?? 0);
  }

  // --- Receivables -----------------------------------------------------------
  if (raw.accountsReceivable !== undefined) {
    results.pctOverdueAr = calc.pctOverdueAr(raw.overdueAr ?? 0, raw.accountsReceivable);
  }
  if (raw.arAging) {
    const { lt30 = 0, lt60 = 0, lt90 = 0, gt90 = 0 } = raw.arAging;
    const totalArAging = calc.sumArAging(lt30, lt60, lt90, gt90);
    results.totalArAging = totalArAging;
    const delta = calc.arReconciliationDelta(totalArAging, raw.accountsReceivable ?? 0);
    if (delta !== 0) {
      warnings.push({
        field: 'totalArAging',
        message: `Total of Receivable Aging differs from Accounts Receivable by ${delta}`,
      });
    }
  }

  // --- Payables (CFO only) ----------------------------------------------------
  if (raw.apAging) {
    const { lt30 = 0, lt60 = 0, lt90 = 0, gt90 = 0 } = raw.apAging;
    const totalApAging = calc.sumApAging(lt30, lt60, lt90, gt90);
    results.totalApAging = totalApAging;
    const delta = calc.apReconciliationDelta(totalApAging, raw.accountsPayable ?? 0);
    if (delta !== 0) {
      warnings.push({
        field: 'totalApAging',
        message: `Total of Payable Aging differs from Accounts Payable by ${delta}`,
      });
    }
  }

  // --- Balance sheet (CFO only) -----------------------------------------------
  if (raw.fixedAssets !== undefined) {
    const totalAssetsVal = calc.totalAssets(raw.fixedAssets ?? 0, raw.currentAssets ?? 0, raw.otherAssets ?? 0);
    const totalLiabEquityVal = calc.totalLiabEquity(
      raw.currentLiabilities ?? 0,
      raw.longTermLiabilities ?? 0,
      raw.equity ?? 0
    );
    results.totalAssets = totalAssetsVal;
    results.totalLiabEquity = totalLiabEquityVal;

    const delta = calc.balanceSheetReconciliationDelta(totalLiabEquityVal, totalAssetsVal);
    if (delta !== 0) {
      warnings.push({
        field: 'totalLiabEquity',
        message: `Total Assets and Total Liabilities & Equity differ by ${delta}`,
      });
    }
  }

  return { results, warnings };
}
