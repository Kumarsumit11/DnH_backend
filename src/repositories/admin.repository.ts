import { prisma } from './financialAnalysis.repository';
import type { CompanySummary } from '../types/financialAnalysis.types';

/**
 * FIXED to match your real schema.prisma: `CompanyProfile` has no `email`
 * column of its own — email lives on the related `Account`. The original
 * select (`{ id, companyName, email, verificationStatus, createdAt }`)
 * would throw a Prisma "Unknown field `email`" error at runtime. We select
 * the account relation instead and flatten it below.
 */
const COMPANY_SELECT = {
  id: true,
  companyName: true,
  verificationStatus: true,
  rejectionReason: true,
  createdAt: true,
  informationMemo: true,
  account: { select: { email: true } },
} as const;

type RawCompanyRow = {
  id: string;
  companyName: string;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: Date;
  informationMemo: unknown;
  account: { email: string } | null;
};

function flattenCompany(row: RawCompanyRow): CompanySummary {
  return {
    id: row.id,
    companyName: row.companyName,
    email: row.account?.email ?? '',
    verificationStatus: row.verificationStatus,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt,
    informationMemo: row.informationMemo,
  };
}

export interface FindAllCompaniesParams {
  skip: number;
  take: number;
  verificationStatus?: string;
  search?: string;
}

export interface FindAllCompaniesResult {
  companies: CompanySummary[];
  total: number;
}

export const adminRepository = {
  async findAllCompanies({
    skip,
    take,
    verificationStatus,
    search,
  }: FindAllCompaniesParams): Promise<FindAllCompaniesResult> {
    const where: any = {
      ...(verificationStatus ? { verificationStatus } : {}),
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    // Note: search now matches company name OR the related account's email.
    const searchWhere: any = search
      ? {
          OR: [
            { companyName: { contains: search, mode: 'insensitive' as const } },
            { account: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      prisma.companyProfile.findMany({
        where: { ...where, ...searchWhere },
        select: COMPANY_SELECT,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<RawCompanyRow[]>,
      prisma.companyProfile.count({ where: { ...where, ...searchWhere } }) as unknown as Promise<number>,
    ]);

    return { companies: rows.map(flattenCompany), total };
  },

  async findCompanyById(companyId: string): Promise<CompanySummary | null> {
    const row = (await prisma.companyProfile.findUnique({
      where: { id: companyId },
      select: COMPANY_SELECT,
    })) as unknown as RawCompanyRow | null;
    return row ? flattenCompany(row) : null;
  },
};