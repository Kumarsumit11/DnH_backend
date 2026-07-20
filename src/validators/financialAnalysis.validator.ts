import { z } from 'zod';

/**
 * Fields the client is allowed to submit. Note: profitMargin, revenueGrowth,
 * and sharesRemaining are NOT accepted from the client — they are always
 * calculated server-side in the service layer so they can never drift from
 * the source numbers.
 */
export const financialAnalysisUpsertSchema = z
  .object({
    companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),

    financialYear: z
      .number()
      .int()
      .min(2000, 'financialYear must be 2000 or later')
      .max(2100, 'financialYear must be 2100 or earlier'),
    month: z.number().int().min(1, 'month must be between 1 and 12').max(12, 'month must be between 1 and 12'),

    revenue: z.number().nonnegative().optional(),
    revenueTarget: z.number().nonnegative().optional(),
    grossProfit: z.number().optional(),
    operatingProfit: z.number().optional(),
    netProfitBeforeTax: z.number().optional(),
    operatingExpenses: z.number().nonnegative().optional(),
    costOfGoodsSold: z.number().nonnegative().optional(),
    otherIncome: z.number().nonnegative().optional(),
    financeExpense: z.number().nonnegative().optional(),

    cashFlow: z.number().optional(),
    currentRatio: z.number().nonnegative().optional(),
    inventory: z.number().nonnegative().optional(),
    accountsReceivable: z.number().nonnegative().optional(),
    totalAssets: z.number().nonnegative().optional(),
    totalLiabilities: z.number().nonnegative().optional(),

    shareCapital: z.number().nonnegative().optional(),
    totalShares: z.number().int().nonnegative().optional(),
    sharesSold: z.number().int().nonnegative().optional(),

    fundingTarget: z.number().nonnegative().optional(),
    fundingRaised: z.number().nonnegative().optional(),
    investorCount: z.number().int().nonnegative().optional(),
  })
  .refine(
    (data) => data.totalShares === undefined || data.sharesSold === undefined || data.sharesSold <= data.totalShares,
    {
      message: 'sharesSold cannot exceed totalShares',
      path: ['sharesSold'],
    }
  );

export type FinancialAnalysisUpsertInput = z.infer<typeof financialAnalysisUpsertSchema>;

export const companyIdParamSchema = z.object({
  companyId: z.string().uuid({ message: 'companyId must be a valid UUID' }),
});

export const chartsQuerySchema = z.object({
  months: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 12))
    .pipe(z.number().int().min(1).max(60)),
});

export const adminCompaniesQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  verificationStatus: z.string().optional(),
  search: z.string().optional(),
});

export type AdminCompaniesQueryInput = z.infer<typeof adminCompaniesQuerySchema>;
