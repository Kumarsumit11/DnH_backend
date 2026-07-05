"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investmentRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
exports.investmentRepository = {
    createProposal: (investorId, fundingOpportunityId, proposedAmount, message) => prisma_1.prisma.investmentProposal.create({
        data: { investorId, fundingOpportunityId, proposedAmount, message }
    }),
    findProposalById: (id) => prisma_1.prisma.investmentProposal.findUnique({
        where: { id },
        include: { investor: true, fundingOpportunity: { include: { company: true } } }
    }),
    listProposalsByInvestor: (investorId) => prisma_1.prisma.investmentProposal.findMany({
        where: { investorId },
        include: { fundingOpportunity: true },
        orderBy: { createdAt: 'desc' }
    }),
    listProposalsForCompany: (companyId) => prisma_1.prisma.investmentProposal.findMany({
        where: { fundingOpportunity: { companyId } },
        include: { investor: { include: { account: true } }, fundingOpportunity: true },
        orderBy: { createdAt: 'desc' }
    }),
    updateProposalStatus: (id, status) => prisma_1.prisma.investmentProposal.update({ where: { id }, data: { status } }),
    createInvestment: (investorId, fundingOpportunityId, proposalId, amount) => prisma_1.prisma.investment.create({
        data: { investorId, fundingOpportunityId, proposalId, amount, status: client_1.InvestmentStatus.CONFIRMED }
    }),
    listInvestmentsByInvestor: (investorId) => prisma_1.prisma.investment.findMany({
        where: { investorId },
        include: { fundingOpportunity: { include: { company: true } } },
        orderBy: { createdAt: 'desc' }
    }),
    listInvestmentsForCompany: (companyId) => prisma_1.prisma.investment.findMany({
        where: { fundingOpportunity: { companyId } },
        include: { investor: { include: { account: true } }, fundingOpportunity: true },
        orderBy: { createdAt: 'desc' }
    })
};
