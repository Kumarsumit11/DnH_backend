"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
exports.companyRepository = {
    findByAccountId: (accountId) => prisma_1.prisma.companyProfile.findUnique({ where: { accountId } }),
    findById: (id) => prisma_1.prisma.companyProfile.findUnique({ where: { id }, include: { account: true, fundingOpportunities: true } }),
    update: (accountId, data) => prisma_1.prisma.companyProfile.update({ where: { accountId }, data }),
    updateLogo: (accountId, logoUrl) => prisma_1.prisma.companyProfile.update({ where: { accountId }, data: { logoUrl } }),
    submitForVerification: (accountId) => prisma_1.prisma.companyProfile.update({ where: { accountId }, data: { verificationStatus: client_1.VerificationStatus.PENDING } }),
    setVerificationStatus: (id, status, rejectionReason) => prisma_1.prisma.companyProfile.update({ where: { id }, data: { verificationStatus: status, rejectionReason } }),
    listPendingVerification: () => prisma_1.prisma.companyProfile.findMany({
        where: { verificationStatus: client_1.VerificationStatus.PENDING },
        include: { account: true }
    }),
    listApprovedWithFilters: (filters, skip, take) => prisma_1.prisma.companyProfile.findMany({
        where: {
            verificationStatus: client_1.VerificationStatus.VERIFIED,
            industry: filters.industry,
            fundingOpportunities: {
                some: {
                    status: client_1.FundingStatus.ACTIVE,
                    fundNeeded: {
                        gte: filters.minFund,
                        lte: filters.maxFund
                    }
                }
            }
        },
        include: { fundingOpportunities: { where: { status: client_1.FundingStatus.ACTIVE } } },
        skip,
        take
    })
};
