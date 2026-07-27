// prisma/seed-indicators.ts
//
// Seeds indicator_definitions — this table was empty, which is why every
// section in the Tally form rendered with headers but no rows. Codes here
// match exactly what tallySections.ts and tally.controller.ts's
// shapeRawValuesForCalculation() already expect — no frontend changes needed.
//
// Run with: npx ts-node prisma/seed-indicators.ts
// (or add "prisma": { "seed": "ts-node prisma/seed-indicators.ts" } to
// package.json and run `npx prisma db seed`)
//
// Products 1-5 / "Total Sales by Product" deliberately omitted — dropped
// earlier per your call not to support per-product entry. Add them back
// (as a `product_sales` code with a `productId`) if you change your mind.

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type DataType = 'CURRENCY' | 'PERCENT' | 'DAYS' | 'COUNT' | 'RATIO';
type CalculationType = 'SUM' | 'AVERAGE' | 'LAST_VALUE';
type DashboardScope = 'CEO' | 'CFO' | 'BOTH';

interface Def {
  code: string;
  label: string;
  dashboardScope: DashboardScope;
  dataType: DataType;
  calculationType: CalculationType;
  hasTarget: boolean;
  hasLastYear: boolean;
  isFormula: boolean;
  allowNegative: boolean;
  sortOrder: number;
}

const defs: Def[] = [
  // ── Revenue & Sales (shared) ──────────────────────────────────────────
  { code: 'total_revenue',   label: 'Total Revenue',  dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM',       hasTarget: true,  hasLastYear: true,  isFormula: false, allowNegative: false, sortOrder: 10 },
  { code: 'sales_growth',    label: 'Sales Growth %', dashboardScope: 'BOTH', dataType: 'PERCENT',  calculationType: 'LAST_VALUE',hasTarget: false, hasLastYear: false, isFormula: true,  allowNegative: true,  sortOrder: 20 },

  // ── P&L Waterfall (shared) ────────────────────────────────────────────
  { code: 'cogs',                 label: 'Cost of Goods Sold',              dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: true,  hasLastYear: true,  isFormula: false, allowNegative: false, sortOrder: 30 },
  { code: 'gross_profit',         label: 'Gross Profit',                    dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: true,  hasLastYear: true,  isFormula: true,  allowNegative: true,  sortOrder: 40 },
  { code: 'opex',                 label: 'Total Operating Expenses',        dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: true,  hasLastYear: true,  isFormula: false, allowNegative: false, sortOrder: 50 },
  { code: 'ebit',                 label: 'Operating Profit (EBIT)',         dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: true,  hasLastYear: true,  isFormula: true,  allowNegative: true,  sortOrder: 60 },
  { code: 'non_op_income',        label: 'Other Non-Operating Income/(Expense)', dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: true, hasLastYear: true, isFormula: false, allowNegative: true, sortOrder: 70 },
  { code: 'finance_expense',      label: 'Finance Expense',                 dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: true,  hasLastYear: true,  isFormula: false, allowNegative: false, sortOrder: 80 },
  { code: 'net_profit_before_tax',label: 'Net Profit Before Tax',           dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: true,  hasLastYear: true,  isFormula: true,  allowNegative: true,  sortOrder: 90 },
  { code: 'net_profit_margin',    label: 'Net Profit Margin %',             dashboardScope: 'BOTH', dataType: 'PERCENT',  calculationType: 'SUM', hasTarget: true,  hasLastYear: true,  isFormula: true,  allowNegative: true,  sortOrder: 100 },

  // ── Headcount (CEO only) ──────────────────────────────────────────────
  { code: 'employee_cost',   label: 'Employee Cost',      dashboardScope: 'CEO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 110 },
  { code: 'headcount_male',  label: 'Headcount — Male',   dashboardScope: 'CEO', dataType: 'COUNT',    calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 120 },
  { code: 'headcount_female',label: 'Headcount — Female', dashboardScope: 'CEO', dataType: 'COUNT',    calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 130 },
  { code: 'headcount_total', label: 'Headcount — Total',  dashboardScope: 'CEO', dataType: 'COUNT',    calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: true,  allowNegative: false, sortOrder: 140 },

  // ── Cash Flow (shared) ────────────────────────────────────────────────
  { code: 'net_operating_cash_flow', label: 'Net Operating Cash Flow', dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: true, sortOrder: 150 },
  { code: 'net_financing_cash_flow', label: 'Net Financing Cash Flow', dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: true, sortOrder: 160 },
  { code: 'net_investing_cash_flow', label: 'Net Investing Cash Flow', dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: true, sortOrder: 170 },
  { code: 'cash_at_eom',             label: 'Cash at End of Month',    dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: true, sortOrder: 180 },

  // ── Receivables (shared) ──────────────────────────────────────────────
  { code: 'accounts_receivable',        label: 'Accounts Receivable',              dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 190 },
  { code: 'days_receivable_outstanding',label: 'Days Receivable Outstanding',      dashboardScope: 'BOTH', dataType: 'DAYS',     calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 200 },
  { code: 'overdue_ar',                 label: 'Overdue Accounts Receivable',      dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 210 },
  { code: 'pct_overdue_ar',             label: '% of Overdue Receivable',          dashboardScope: 'BOTH', dataType: 'PERCENT',  calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: true,  allowNegative: false, sortOrder: 220 },
  { code: 'ar_aging_lt30', label: 'Receivable Aging — <30 Days', dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 230 },
  { code: 'ar_aging_lt60', label: 'Receivable Aging — <60 Days', dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 240 },
  { code: 'ar_aging_lt90', label: 'Receivable Aging — <90 Days', dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 250 },
  { code: 'ar_aging_gt90', label: 'Receivable Aging — >90 Days', dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 260 },
  { code: 'total_ar_aging',label: 'Total Receivable Aging',      dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: true,  allowNegative: false, sortOrder: 270 },

  // ── Inventory (shared) ────────────────────────────────────────────────
  { code: 'inventory',                 label: 'Inventory',                  dashboardScope: 'BOTH', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 280 },
  { code: 'days_inventory_outstanding',label: 'Days Inventory Outstanding', dashboardScope: 'BOTH', dataType: 'DAYS',     calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 290 },

  // ── Payables (CFO only) ───────────────────────────────────────────────
  { code: 'accounts_payable',        label: 'Accounts Payable',              dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 300 },
  { code: 'days_payable_outstanding',label: 'Days Payable Outstanding',      dashboardScope: 'CFO', dataType: 'DAYS',     calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 310 },
  { code: 'ap_aging_lt30', label: 'Payable Aging — <30 Days', dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 320 },
  { code: 'ap_aging_lt60', label: 'Payable Aging — <60 Days', dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 330 },
  { code: 'ap_aging_lt90', label: 'Payable Aging — <90 Days', dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 340 },
  { code: 'ap_aging_gt90', label: 'Payable Aging — >90 Days', dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 350 },
  { code: 'total_ap_aging',label: 'Total Payable Aging',      dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: true,  allowNegative: false, sortOrder: 360 },

  // ── Ratios (CFO only) ─────────────────────────────────────────────────
  { code: 'current_ratio',     label: 'Current Ratio',       dashboardScope: 'CFO', dataType: 'RATIO', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 370 },
  { code: 'quick_ratio',       label: 'Quick Ratio',         dashboardScope: 'CFO', dataType: 'RATIO', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 380 },
  { code: 'debt_equity_ratio', label: 'Debt : Equity Ratio', dashboardScope: 'CFO', dataType: 'RATIO', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 390 },

  // ── Balance Sheet (CFO only) ──────────────────────────────────────────
  { code: 'fixed_assets',          label: 'Fixed Assets',              dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 400 },
  { code: 'current_assets',        label: 'Current Assets',            dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 410 },
  { code: 'other_assets',          label: 'Other Assets',              dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 420 },
  { code: 'total_assets',          label: 'Total Assets',              dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: true,  allowNegative: false, sortOrder: 430 },
  { code: 'current_liabilities',   label: 'Current Liabilities',       dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 440 },
  { code: 'long_term_liabilities', label: 'Long Term Liabilities',     dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: false, sortOrder: 450 },
  { code: 'equity',                label: 'Equity',                   dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: false, allowNegative: true,  sortOrder: 460 },
  { code: 'total_liab_equity',     label: 'Total Liabilities & Equity',dashboardScope: 'CFO', dataType: 'CURRENCY', calculationType: 'SUM', hasTarget: false, hasLastYear: false, isFormula: true,  allowNegative: false, sortOrder: 470 },
];

async function main() {
  for (const d of defs) {
    await prisma.indicatorDefinition.upsert({
      where: { code: d.code },
      update: d,
      create: d,
    });
  }
  console.log(`Seeded ${defs.length} indicator definitions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());