/**
 * calculationService.ts
 *
 * Every function here mirrors one grey (formula) cell from the original
 * Excel workbooks. These are the ONLY places these numbers are computed —
 * never accept them as raw input from the form or the API.
 *
 * All functions take a `values` object keyed by indicator `code` (see
 * migrations/001_create_tally_schema.sql for the code list) holding
 * { actual, target, lastYear } numbers for a single month, plus `products`
 * (array of { actual, target }) where relevant.
 *
 * Safe division: mirrors Excel's IFERROR(...,0) pattern used throughout
 * both workbooks.
 */

export interface ProductAmount {
  actual: number;
  target: number;
}

export function safeDiv(numerator: number, denominator: number): number {
  if (!denominator || Number.isNaN(numerator) || Number.isNaN(denominator)) return 0;
  const result = numerator / denominator;
  return Number.isFinite(result) ? result : 0;
}

export function sum(...nums: Array<number | null | undefined>): number {
  return nums.reduce<number>((acc, n) => acc + (Number(n) || 0), 0);
}

// ---------------------------------------------------------------------------
// Sales / Products
// ---------------------------------------------------------------------------

/** Data!G7 style: (this month / last month) - 1, IFERROR -> 0 */
export function salesGrowth(thisMonthActual: number, lastMonthActual: number): number {
  return safeDiv(thisMonthActual, lastMonthActual) - 1;
}

/** Data!F21 style: SUM of up to 5 product rows for a given value_type */
export function sumProducts(products: ProductAmount[], valueType: keyof ProductAmount = 'actual'): number {
  return sum(...products.map((p) => p[valueType]));
}

// ---------------------------------------------------------------------------
// P&L waterfall
// ---------------------------------------------------------------------------

/** Data!F28: Revenue - COGS */
export function grossProfit(revenue: number, cogs: number): number {
  return sum(revenue, -cogs);
}

/** Data!F34: Gross Profit - OpEx */
export function ebit(grossProfitValue: number, opex: number): number {
  return sum(grossProfitValue, -opex);
}

/** Data!F43: EBIT + Non-op Income/(Expense) - Finance Expense */
export function netProfitBeforeTax(ebitValue: number, nonOpIncome: number, financeExpense: number): number {
  return sum(ebitValue, nonOpIncome, -financeExpense);
}

/** Data!F46: IFERROR(Net Profit / Revenue, 0) */
export function netProfitMargin(netProfit: number, revenue: number): number {
  return safeDiv(netProfit, revenue);
}

// ---------------------------------------------------------------------------
// Headcount
// ---------------------------------------------------------------------------

/** Data!F53: SUM(Male, Female) */
export function headcountTotal(male: number, female: number): number {
  return sum(male, female);
}

// ---------------------------------------------------------------------------
// Receivables
// ---------------------------------------------------------------------------

/** Data!F64: IFERROR(Overdue AR / AR, 0) */
export function pctOverdueAr(overdueAr: number, accountsReceivable: number): number {
  return safeDiv(overdueAr, accountsReceivable);
}

/** Data!F70: SUM of the four AR aging buckets */
export function sumArAging(lt30: number, lt60: number, lt90: number, gt90: number): number {
  return sum(lt30, lt60, lt90, gt90);
}

/** Data!F71 (CEO) / F49 (CFO): aging total minus the reported AR balance.
 * A non-zero result should surface as a validation WARNING, not a stored
 * field — same as the original spreadsheet's inline reconciliation row. */
export function arReconciliationDelta(totalArAging: number, accountsReceivable: number): number {
  return sum(totalArAging, -accountsReceivable);
}

// ---------------------------------------------------------------------------
// Payables (CFO only)
// ---------------------------------------------------------------------------

export function sumApAging(lt30: number, lt60: number, lt90: number, gt90: number): number {
  return sum(lt30, lt60, lt90, gt90);
}

export function apReconciliationDelta(totalApAging: number, accountsPayable: number): number {
  return sum(totalApAging, -accountsPayable);
}

// ---------------------------------------------------------------------------
// Balance sheet (CFO only)
// ---------------------------------------------------------------------------

/** Data!F71 (CFO Balance Sheet block): SUM(Fixed, Current, Other Assets) */
export function totalAssets(fixedAssets: number, currentAssets: number, otherAssets: number): number {
  return sum(fixedAssets, currentAssets, otherAssets);
}

/** Data!F76: SUM(Current Liabilities, Long Term Liabilities, Equity) */
export function totalLiabEquity(currentLiabilities: number, longTermLiabilities: number, equity: number): number {
  return sum(currentLiabilities, longTermLiabilities, equity);
}

/** Data!F77: Total Liab & Equity - Total Assets — validation WARNING only */
export function balanceSheetReconciliationDelta(totalLiabEquityValue: number, totalAssetsValue: number): number {
  return sum(totalLiabEquityValue, -totalAssetsValue);
}

/** Product/target reconciliation (Data!F23 / F24): Total Sales by Product vs
 * Total Revenue, both Actual and Target sides — validation WARNING only. */
export function productReconciliationDelta(totalSalesByProduct: number, totalRevenue: number): number {
  return sum(totalSalesByProduct, -totalRevenue);
}
