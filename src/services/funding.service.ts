import { fundingRepository } from '../repositories/funding.repository';
import { companyRepository } from '../repositories/company.repository';
import { AppError } from '../errors/AppError';
import { FundingStatus, VerificationStatus, Prisma } from '@prisma/client';
import { auditRepository } from '../repositories/audit.repository';
import { notificationRepository } from '../repositories/notification.repository';

export const fundingService = {
  async create(accountId: string, data: Omit<Prisma.FundingOpportunityCreateInput, 'company'>) {
    const company = await companyRepository.findByAccountId(accountId);
    if (!company) throw AppError.notFound('Company profile not found');
    if (company.verificationStatus !== VerificationStatus.VERIFIED) {
      throw AppError.forbidden('Company must be verified before publishing funding opportunities');
    }

    const opportunity = await fundingRepository.create(company.id, { ...data, status: FundingStatus.PENDING_APPROVAL });
    await auditRepository.logActivity(accountId, 'FUNDING_CREATED', `Created funding opportunity: ${opportunity.title}`);
    return opportunity;
  },

  async listOwn(accountId: string) {
    const company = await companyRepository.findByAccountId(accountId);
    if (!company) throw AppError.notFound('Company profile not found');
    const opportunities = await fundingRepository.listByCompany(company.id);
    return Promise.all(opportunities.map(async (o) => {
      const sharesSold = o.totalShares ? await fundingRepository.getSharesSold(o.id) : 0;
      return {
        ...o,
        sharesSold,
        sharesRemaining: o.totalShares ? o.totalShares - sharesSold : null
      };
    }));
  },

  async getById(id: string) {
    const opportunity = await fundingRepository.findById(id);
    if (!opportunity) throw AppError.notFound('Funding opportunity not found');
    const sharesSold = opportunity.totalShares ? await fundingRepository.getSharesSold(id) : 0;
    return {
      ...opportunity,
      sharesSold,
      sharesRemaining: opportunity.totalShares ? opportunity.totalShares - sharesSold : null
    };
  },

  async update(accountId: string, id: string, data: Prisma.FundingOpportunityUpdateInput) {
    const opportunity = await fundingRepository.findById(id);
    if (!opportunity) throw AppError.notFound('Funding opportunity not found');

    const company = await companyRepository.findByAccountId(accountId);
    if (!company || opportunity.companyId !== company.id) throw AppError.forbidden('Not authorized to edit this opportunity');

    return fundingRepository.update(id, data);
  },

  async delete(accountId: string, id: string) {
    const opportunity = await fundingRepository.findById(id);
    if (!opportunity) throw AppError.notFound('Funding opportunity not found');

    const company = await companyRepository.findByAccountId(accountId);
    if (!company || opportunity.companyId !== company.id) throw AppError.forbidden('Not authorized to delete this opportunity');

    return fundingRepository.delete(id);
  },

  async listPendingApproval() {
    return fundingRepository.listPendingApproval();
  },

  async setStatus(id: string, status: FundingStatus, rejectionReason?: string) {
    const opportunity = await fundingRepository.updateStatus(id, status, rejectionReason);
    const company = await companyRepository.findById(opportunity.companyId);
    if (company) {
      await notificationRepository.create(
        company.accountId,
        'FUNDING',
        `Funding opportunity ${status.toLowerCase()}`,
        `Your funding opportunity "${opportunity.title}" was ${status.toLowerCase()}.`
      );
    }
    return opportunity;
  },

  async listActive(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const list = await fundingRepository.listActive(skip, limit);
    return Promise.all(list.map(async (o) => {
      const sharesSold = o.totalShares ? await fundingRepository.getSharesSold(o.id) : 0;
      return {
        ...o,
        sharesSold,
        sharesRemaining: o.totalShares ? o.totalShares - sharesSold : null
      };
    }));
  }
};
