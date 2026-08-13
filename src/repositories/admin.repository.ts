import { prisma } from './financialAnalysis.repository';
import type { CompanySummary } from '../types/financialAnalysis.types';

/**
 * Company fields used by the Admin APIs.
 *
 * Email belongs to the related Account, not CompanyProfile.
 *
 * Documents are loaded from Account.documents and limited to the
 * two document types currently required by the Admin company view:
 *
 * - INFORMATION_MEMO
 * - TALLY_REPORT
 */
const COMPANY_SELECT = {
  id: true,
  companyName: true,
  verificationStatus: true,
  rejectionReason: true,
  createdAt: true,
  informationMemo: true,

  account: {
    select: {
      email: true,

      documents: {
        where: {
          type: {
            in: ['INFORMATION_MEMO', 'TALLY_REPORT'] as any,
          },
        },

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          type: true,
          status: true,
          fileName: true,
          fileUrl: true,
          mimeType: true,
          sizeBytes: true,
          rejectionReason: true,
          reviewedBy: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  },
} as const;

type RawCompanyRow = {
  id: string;
  companyName: string;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: Date;
  informationMemo: unknown;

  account: {
    email: string;

    documents: Array<{
      id: string;
      type: string;
      status: string;
      fileName: string;
      fileUrl: string;
      mimeType: string;
      sizeBytes: number;
      rejectionReason: string | null;
      reviewedBy: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  } | null;
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

    documents: row.account?.documents ?? [],
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

export interface InvestorInvestmentRow {
  id: string;
  amount: string;
  shares: number | null;
  status: string;
  createdAt: Date;
  companyId: string;
  companyName: string;
  opportunityTitle: string;
}

export interface InvestorInvestmentsResult {
  investments: InvestorInvestmentRow[];
  totalInvested: number;
}

export const adminRepository = {
  async findAllCompanies({
    skip,
    take,
    verificationStatus,
    search,
  }: FindAllCompaniesParams): Promise<FindAllCompaniesResult> {
    const searchWhere: any = search
      ? {
          OR: [
            {
              companyName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              account: {
                email: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : {};

    const where: any = {
      ...(verificationStatus ? { verificationStatus } : {}),
      ...searchWhere,
    };

    const [rows, total] = await Promise.all([
      prisma.companyProfile.findMany({
        where,
        select: COMPANY_SELECT,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }) as unknown as Promise<RawCompanyRow[]>,

      prisma.companyProfile.count({
        where,
      }) as unknown as Promise<number>,
    ]);

    return {
      companies: rows.map(flattenCompany),
      total,
    };
  },

  async findCompanyById(
    companyId: string
  ): Promise<CompanySummary | null> {
    const row =
      (await prisma.companyProfile.findUnique({
        where: {
          id: companyId,
        },

        select: COMPANY_SELECT,
      })) as unknown as RawCompanyRow | null;

    return row ? flattenCompany(row) : null;
  },

  async findInvestorInvestments(
    investorId: string
  ): Promise<InvestorInvestmentsResult> {
    const rows = await prisma.investment.findMany({
      where: {
        investorId,
      },

      select: {
        id: true,
        amount: true,
        shares: true,
        status: true,
        createdAt: true,

        fundingOpportunity: {
          select: {
            title: true,

            company: {
              select: {
                id: true,
                companyName: true,
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });

    const investments: InvestorInvestmentRow[] =
      rows.map((r) => ({
        id: r.id,
        amount: r.amount.toString(),
        shares: r.shares,
        status: r.status,
        createdAt: r.createdAt,
        companyId: r.fundingOpportunity.company.id,
        companyName:
          r.fundingOpportunity.company.companyName,
        opportunityTitle:
          r.fundingOpportunity.title,
      }));

    const totalInvested = rows.reduce(
      (sum, r) => sum + Number(r.amount),
      0
    );

    return {
      investments,
      totalInvested,
    };
  },
};