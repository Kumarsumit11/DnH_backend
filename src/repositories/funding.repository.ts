import { prisma } from '../config/prisma';
import { FundingStatus, Prisma } from '@prisma/client';

export const fundingRepository = {
  create: (companyId: string, data: Omit<Prisma.FundingOpportunityCreateInput, 'company'>) =>
    prisma.fundingOpportunity.create({ data: { ...data, company: { connect: { id: companyId } } } }),

  findById: (id: string) =>
    prisma.fundingOpportunity.findUnique({ where: { id }, include: { company: true } }),

  listByCompany: (companyId: string) =>
    prisma.fundingOpportunity.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } }),

  update: (id: string, data: Prisma.FundingOpportunityUpdateInput) =>
    prisma.fundingOpportunity.update({ where: { id }, data }),

  updateStatus: (id: string, status: FundingStatus, rejectionReason?: string) =>
    prisma.fundingOpportunity.update({ where: { id }, data: { status, rejectionReason } }),

  delete: (id: string) => prisma.fundingOpportunity.delete({ where: { id } }),

  listPendingApproval: () =>
    prisma.fundingOpportunity.findMany({ where: { status: FundingStatus.PENDING_APPROVAL }, include: { company: true } }),

  listActive: (skip: number, take: number) =>
    prisma.fundingOpportunity.findMany({ where: { status: FundingStatus.ACTIVE }, include: { company: true }, skip, take }),

  getSharesSold: async (fundingOpportunityId: string) => {
    const result = await prisma.investment.aggregate({
      where: {
        fundingOpportunityId,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      _sum: { shares: true }
    });
    return result._sum.shares ?? 0;
  }
};
