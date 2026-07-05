import { prisma } from '../config/prisma';
import { ProposalStatus, InvestmentStatus } from '@prisma/client';

export const investmentRepository = {
  createProposal: (investorId: string, fundingOpportunityId: string, proposedAmount: number, message?: string) =>
    prisma.investmentProposal.create({
      data: { investorId, fundingOpportunityId, proposedAmount, message }
    }),

  findProposalById: (id: string) =>
    prisma.investmentProposal.findUnique({
      where: { id },
      include: { investor: true, fundingOpportunity: { include: { company: true } } }
    }),

  listProposalsByInvestor: (investorId: string) =>
    prisma.investmentProposal.findMany({
      where: { investorId },
      include: { fundingOpportunity: true },
      orderBy: { createdAt: 'desc' }
    }),

  listProposalsForCompany: (companyId: string) =>
    prisma.investmentProposal.findMany({
      where: { fundingOpportunity: { companyId } },
      include: { investor: { include: { account: true } }, fundingOpportunity: true },
      orderBy: { createdAt: 'desc' }
    }),

  updateProposalStatus: (id: string, status: ProposalStatus) =>
    prisma.investmentProposal.update({ where: { id }, data: { status } }),

  createInvestment: (investorId: string, fundingOpportunityId: string, proposalId: string, amount: number) =>
    prisma.investment.create({
      data: { investorId, fundingOpportunityId, proposalId, amount, status: InvestmentStatus.CONFIRMED }
    }),

  listInvestmentsByInvestor: (investorId: string) =>
    prisma.investment.findMany({
      where: { investorId },
      include: { fundingOpportunity: { include: { company: true } } },
      orderBy: { createdAt: 'desc' }
    }),

  listInvestmentsForCompany: (companyId: string) =>
    prisma.investment.findMany({
      where: { fundingOpportunity: { companyId } },
      include: { investor: { include: { account: true } }, fundingOpportunity: true },
      orderBy: { createdAt: 'desc' }
    })
};
