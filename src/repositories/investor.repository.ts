import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const investorRepository = {
  findByAccountId: (accountId: string) => prisma.investorProfile.findUnique({ where: { accountId } }),

  findById: (id: string) => prisma.investorProfile.findUnique({ where: { id }, include: { account: true } }),

  update: (accountId: string, data: Prisma.InvestorProfileUpdateInput) =>
    prisma.investorProfile.update({ where: { accountId }, data }),

  updateAvatar: (accountId: string, avatarUrl: string) =>
    prisma.investorProfile.update({ where: { accountId }, data: { avatarUrl } })
};
