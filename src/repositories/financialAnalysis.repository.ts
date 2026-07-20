import { PrismaClient } from '@prisma/client';
import type { FinancialAnalysisFields, FinancialAnalysisRecord } from '../types/financialAnalysis.types';

export const prisma = new PrismaClient();

/** Data accepted by upsert(): the client-submitted fields plus the three server-calculated ones. */
export interface FinancialAnalysisUpsertData extends FinancialAnalysisFields {
  profitMargin: number | null;
  revenueGrowth: number | null;
  sharesRemaining: number | null;
}

/**
 * Repository layer: raw Prisma access only. No business logic, no
 * calculations — that belongs in the service layer.
 *
 * NOTE: `prisma.financialAnalysis` will only type-check once you've merged
 * prisma/financial-analysis.prisma into your schema.prisma and run
 * `npx prisma generate` (see README). Until then, cast `prisma` as `any`
 * or leave these calls as-is — they'll resolve automatically once the
 * generated client picks up the model.
 */
export const financialAnalysisRepository = {
  /** Upsert a single (companyId, financialYear, month) period record. */
  async upsert(
    companyId: string,
    financialYear: number,
    month: number,
    data: FinancialAnalysisUpsertData
  ): Promise<FinancialAnalysisRecord> {
    return prisma.financialAnalysis.upsert({
      where: {
        companyId_financialYear_month: { companyId, financialYear, month },
      },
      update: data,
      create: { companyId, financialYear, month, ...data },
    }) as unknown as Promise<FinancialAnalysisRecord>;
  },

  /** Latest period record for a company (by year, then month). */
  async findLatestByCompanyId(companyId: string): Promise<FinancialAnalysisRecord | null> {
    return prisma.financialAnalysis.findFirst({
      where: { companyId },
      orderBy: [{ financialYear: 'desc' }, { month: 'desc' }],
    }) as unknown as Promise<FinancialAnalysisRecord | null>;
  },

  /** All period records for a company, most recent first. */
  async findAllByCompanyId(companyId: string, take?: number): Promise<FinancialAnalysisRecord[]> {
    return prisma.financialAnalysis.findMany({
      where: { companyId },
      orderBy: [{ financialYear: 'desc' }, { month: 'desc' }],
      ...(take ? { take } : {}),
    }) as unknown as Promise<FinancialAnalysisRecord[]>;
  },

  /** The record immediately preceding the given period (for MoM growth). */
  async findPreviousPeriod(
    companyId: string,
    financialYear: number,
    month: number
  ): Promise<FinancialAnalysisRecord | null> {
    return prisma.financialAnalysis.findFirst({
      where: {
        companyId,
        OR: [
          { financialYear, month: { lt: month } },
          { financialYear: { lt: financialYear } },
        ],
      },
      orderBy: [{ financialYear: 'desc' }, { month: 'desc' }],
    }) as unknown as Promise<FinancialAnalysisRecord | null>;
  },

  /** Same calendar month, prior financial year (for YoY comparisons). */
  async findSameMonthLastYear(
    companyId: string,
    financialYear: number,
    month: number
  ): Promise<FinancialAnalysisRecord | null> {
    return prisma.financialAnalysis.findFirst({
      where: { companyId, financialYear: financialYear - 1, month },
    }) as unknown as Promise<FinancialAnalysisRecord | null>;
  },

  /** Chronological records within the last N months (for chart series). */
  async findRecentPeriods(companyId: string, monthsBack: number): Promise<FinancialAnalysisRecord[]> {
    const records = (await prisma.financialAnalysis.findMany({
      where: { companyId },
      orderBy: [{ financialYear: 'desc' }, { month: 'desc' }],
      take: monthsBack,
    })) as unknown as FinancialAnalysisRecord[];
    return records.reverse(); // chronological order for charts
  },

  async deleteById(id: string): Promise<FinancialAnalysisRecord> {
    return prisma.financialAnalysis.delete({ where: { id } }) as unknown as Promise<FinancialAnalysisRecord>;
  },

  async findById(id: string): Promise<FinancialAnalysisRecord | null> {
    return prisma.financialAnalysis.findUnique({
      where: { id },
    }) as unknown as Promise<FinancialAnalysisRecord | null>;
  },
};
