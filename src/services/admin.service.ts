import { adminRepository } from '../repositories/admin.repository';
import { financialAnalysisRepository } from '../repositories/financialAnalysis.repository';
import { NotFoundError } from '../utils/errors';
import { computeDerivedMetrics, healthScoreLabel } from '../utils/financialCalculations';
import { toFrontendShape, financialAnalysisService } from './financialAnalysis.service';
import type {
  FundingStatus,
  ListCompaniesQuery,
  AdminCompaniesListResult,
  AdminCompanyDetailResult,
  AdminCompanyListItem,
  CompanyChartsResult,
} from '../types/financialAnalysis.types';

function fundingStatus(fundingProgress: number | null | undefined): FundingStatus {
  if (fundingProgress === null || fundingProgress === undefined) return 'NO_DATA';
  if (fundingProgress >= 100) return 'FULLY_FUNDED';
  if (fundingProgress >= 50) return 'ON_TRACK';
  if (fundingProgress > 0) return 'EARLY_STAGE';
  return 'NOT_STARTED';
}

export const adminService = {
  /** GET /admin/companies — list with verification, funding status, health score. */
  async listCompanies({ page, limit, verificationStatus, search }: ListCompaniesQuery): Promise<AdminCompaniesListResult> {
    const skip = (page - 1) * limit;
    const { companies, total } = await adminRepository.findAllCompanies({
      skip,
      take: limit,
      verificationStatus,
      search,
    });

    const enriched: AdminCompanyListItem[] = await Promise.all(
      companies.map(async (company) => {
        const latest = await financialAnalysisRepository.findLatestByCompanyId(company.id);
        if (!latest) {
          return {
            id: company.id,
            companyName: company.companyName,
            email: company.email,
            verificationStatus: company.verificationStatus,
            createdAt: company.createdAt,
            fundingStatus: 'NO_DATA' as FundingStatus,
            fundingProgressPercent: null,
            financialHealthScore: null,
            financialHealthLabel: healthScoreLabel(null),
            latestPeriod: null,
            fundingRaised: null,
            fundingTarget: null,
            investorCount: null,
          };
        }

        const [previousPeriod, sameMonthLastYear] = await Promise.all([
          financialAnalysisRepository.findPreviousPeriod(company.id, latest.financialYear, latest.month),
          financialAnalysisRepository.findSameMonthLastYear(company.id, latest.financialYear, latest.month),
        ]);
        const derived = computeDerivedMetrics(latest, previousPeriod, sameMonthLastYear);

        return {
          id: company.id,
          companyName: company.companyName,
          email: company.email,
          verificationStatus: company.verificationStatus,
          createdAt: company.createdAt,
          fundingStatus: fundingStatus(derived.fundingProgress),
          fundingProgressPercent: derived.fundingProgress,
          financialHealthScore: derived.financialHealthScore,
          financialHealthLabel: healthScoreLabel(derived.financialHealthScore),
          latestPeriod: `${latest.financialYear}-${String(latest.month).padStart(2, '0')}`,
          fundingRaised: latest.fundingRaised,
          fundingTarget: latest.fundingTarget,
          investorCount: latest.investorCount,
        };
      })
    );

    return {
      companies: enriched,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  /** GET /admin/company/:companyId — full company + financial detail. */
  async getCompanyDetail(companyId: string): Promise<AdminCompanyDetailResult> {
    const company = await adminRepository.findCompanyById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    const latest = await financialAnalysisRepository.findLatestByCompanyId(companyId);

    let financial: AdminCompanyDetailResult['financial'] = null;
    if (latest) {
      const [previousPeriod, sameMonthLastYear] = await Promise.all([
        financialAnalysisRepository.findPreviousPeriod(companyId, latest.financialYear, latest.month),
        financialAnalysisRepository.findSameMonthLastYear(companyId, latest.financialYear, latest.month),
      ]);
      const derived = computeDerivedMetrics(latest, previousPeriod, sameMonthLastYear);
      financial = toFrontendShape(latest, derived);
    }

    return {
      company: {
        id: company.id,
        companyName: company.companyName,
        email: company.email,
        verificationStatus: company.verificationStatus,
        createdAt: company.createdAt,
        informationMemo: company.informationMemo,
      },
      financial,
      fundingStatus: financial ? fundingStatus(financial.funding.fundingProgressPercent) : 'NO_DATA',
    };
  },

  /** GET /admin/company/:companyId/charts — reuses the same chart builder. */
  async getCompanyCharts(companyId: string, monthsBack?: number): Promise<CompanyChartsResult> {
    const company = await adminRepository.findCompanyById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }
    return financialAnalysisService.getCompanyCharts(companyId, monthsBack);
  },
};
