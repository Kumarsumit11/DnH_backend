// company.repository.ts
import { prisma } from '../config/prisma';
import { VerificationStatus, FundingStatus, Prisma } from '@prisma/client';

export const companyRepository = {
  findByAccountId: (accountId: string) => prisma.companyProfile.findUnique({ where: { accountId } }),

  findById: (id: string) =>
    prisma.companyProfile.findUnique({ where: { id }, include: { account: true, fundingOpportunities: true } }),

  update: (accountId: string, data: Prisma.CompanyProfileUpdateInput) =>
    prisma.companyProfile.upsert({
      where: { accountId },
      update: data,
      create: {
        ...(data as unknown as Prisma.CompanyProfileUncheckedCreateInput),
        accountId,
        companyName: (data.companyName as string) ?? 'Unnamed Company',
      },
    }),

  updateLogo: (accountId: string, logoUrl: string) =>
    prisma.companyProfile.update({ where: { accountId }, data: { logoUrl } }),

  submitForVerification: (accountId: string) =>
    prisma.companyProfile.update({ where: { accountId }, data: { verificationStatus: VerificationStatus.PENDING } }),

  setVerificationStatus: (id: string, status: VerificationStatus, rejectionReason?: string) =>
    prisma.companyProfile.update({ where: { id }, data: { verificationStatus: status, rejectionReason } }),

  listPendingVerification: () =>
    prisma.companyProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: { account: true }
    }),

  listApprovedWithFilters: (filters: { industry?: string; minFund?: number; maxFund?: number }, skip: number, take: number) =>
    prisma.companyProfile.findMany({
      where: {
        verificationStatus: VerificationStatus.VERIFIED,
        industry: filters.industry,
        fundingOpportunities: {
          some: {
            status: FundingStatus.ACTIVE,
            fundNeeded: { gte: filters.minFund, lte: filters.maxFund }
          }
        }
      },
      include: { fundingOpportunities: { where: { status: FundingStatus.ACTIVE } } },
      skip,
      take
    })
};