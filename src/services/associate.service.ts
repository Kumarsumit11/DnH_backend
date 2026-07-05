import { companyRepository } from '../repositories/company.repository';
import { fundingRepository } from '../repositories/funding.repository';
import { documentRepository } from '../repositories/document.repository';
import { prisma } from '../config/prisma';
import { emailService } from '../emails/email.service';
import { VerificationStatus, FundingStatus, DocumentStatus, Role, AccountStatus } from '@prisma/client';
import { AppError } from '../errors/AppError';

export const associateService = {
  async listPendingCompanies() {
    return companyRepository.listPendingVerification();
  },

  async approveCompany(companyId: string) {
    const company = await companyRepository.setVerificationStatus(companyId, VerificationStatus.VERIFIED);
    const account = await prisma.account.findUnique({ where: { id: company.accountId } });
    if (account) await emailService.sendCompanyApprovedEmail(account.email, company.companyName);
    return company;
  },

  async rejectCompany(companyId: string, reason: string) {
    const company = await companyRepository.setVerificationStatus(companyId, VerificationStatus.REJECTED, reason);
    const account = await prisma.account.findUnique({ where: { id: company.accountId } });
    if (account) await emailService.sendCompanyRejectedEmail(account.email, company.companyName, reason);
    return company;
  },

  async listPendingFunding() {
    return fundingRepository.listPendingApproval();
  },

  async listPendingDocuments() {
    return documentRepository.listPending();
  },

  async listAllUsers(role?: Role) {
    return prisma.account.findMany({
      where: role ? { role } : undefined,
      include: { investorProfile: true, companyProfile: true },
      orderBy: { createdAt: 'desc' }
    });
  },

  async suspendUser(accountId: string) {
    return prisma.account.update({ where: { id: accountId }, data: { status: AccountStatus.SUSPENDED } });
  },

  async reactivateUser(accountId: string) {
    return prisma.account.update({ where: { id: accountId }, data: { status: AccountStatus.ACTIVE } });
  },

  async getAnalytics() {
    const [
      totalInvestors,
      totalCompanies,
      verifiedCompanies,
      pendingCompanies,
      totalFundingOpportunities,
      activeFundingOpportunities,
      totalProposals,
      totalInvestments,
      totalInvestmentVolume
    ] = await Promise.all([
      prisma.investorProfile.count(),
      prisma.companyProfile.count(),
      prisma.companyProfile.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
      prisma.companyProfile.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      prisma.fundingOpportunity.count(),
      prisma.fundingOpportunity.count({ where: { status: FundingStatus.ACTIVE } }),
      prisma.investmentProposal.count(),
      prisma.investment.count(),
      prisma.investment.aggregate({ _sum: { amount: true } })
    ]);

    return {
      totalInvestors,
      totalCompanies,
      verifiedCompanies,
      pendingCompanies,
      totalFundingOpportunities,
      activeFundingOpportunities,
      totalProposals,
      totalInvestments,
      totalInvestmentVolume: totalInvestmentVolume._sum.amount || 0
    };
  }
};
