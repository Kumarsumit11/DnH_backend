"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.associateService = void 0;
const company_repository_1 = require("../repositories/company.repository");
const funding_repository_1 = require("../repositories/funding.repository");
const document_repository_1 = require("../repositories/document.repository");
const prisma_1 = require("../config/prisma");
const email_service_1 = require("../emails/email.service");
const client_1 = require("@prisma/client");
exports.associateService = {
    async listPendingCompanies() {
        return company_repository_1.companyRepository.listPendingVerification();
    },
    async approveCompany(companyId) {
        const company = await company_repository_1.companyRepository.setVerificationStatus(companyId, client_1.VerificationStatus.VERIFIED);
        const account = await prisma_1.prisma.account.findUnique({ where: { id: company.accountId } });
        if (account)
            await email_service_1.emailService.sendCompanyApprovedEmail(account.email, company.companyName);
        return company;
    },
    async rejectCompany(companyId, reason) {
        const company = await company_repository_1.companyRepository.setVerificationStatus(companyId, client_1.VerificationStatus.REJECTED, reason);
        const account = await prisma_1.prisma.account.findUnique({ where: { id: company.accountId } });
        if (account)
            await email_service_1.emailService.sendCompanyRejectedEmail(account.email, company.companyName, reason);
        return company;
    },
    async listPendingFunding() {
        return funding_repository_1.fundingRepository.listPendingApproval();
    },
    async listPendingDocuments() {
        return document_repository_1.documentRepository.listPending();
    },
    async listAllUsers(role) {
        return prisma_1.prisma.account.findMany({
            where: role ? { role } : undefined,
            include: { investorProfile: true, companyProfile: true },
            orderBy: { createdAt: 'desc' }
        });
    },
    async suspendUser(accountId) {
        return prisma_1.prisma.account.update({ where: { id: accountId }, data: { status: client_1.AccountStatus.SUSPENDED } });
    },
    async reactivateUser(accountId) {
        return prisma_1.prisma.account.update({ where: { id: accountId }, data: { status: client_1.AccountStatus.ACTIVE } });
    },
    async getAnalytics() {
        const [totalInvestors, totalCompanies, verifiedCompanies, pendingCompanies, totalFundingOpportunities, activeFundingOpportunities, totalProposals, totalInvestments, totalInvestmentVolume] = await Promise.all([
            prisma_1.prisma.investorProfile.count(),
            prisma_1.prisma.companyProfile.count(),
            prisma_1.prisma.companyProfile.count({ where: { verificationStatus: client_1.VerificationStatus.VERIFIED } }),
            prisma_1.prisma.companyProfile.count({ where: { verificationStatus: client_1.VerificationStatus.PENDING } }),
            prisma_1.prisma.fundingOpportunity.count(),
            prisma_1.prisma.fundingOpportunity.count({ where: { status: client_1.FundingStatus.ACTIVE } }),
            prisma_1.prisma.investmentProposal.count(),
            prisma_1.prisma.investment.count(),
            prisma_1.prisma.investment.aggregate({ _sum: { amount: true } })
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
