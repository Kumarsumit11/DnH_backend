import { prisma } from '../config/prisma';
import { VerificationPurpose } from '@prisma/client';

export const verificationRepository = {
  create: (accountId: string, purpose: VerificationPurpose, codeHash: string, expiresAt: Date) =>
    prisma.verification.create({ data: { accountId, purpose, codeHash, expiresAt } }),

  findLatestActive: (accountId: string, purpose: VerificationPurpose) =>
    prisma.verification.findFirst({
      where: { accountId, purpose, consumed: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    }),

  markConsumed: (id: string) => prisma.verification.update({ where: { id }, data: { consumed: true } }),

  incrementAttempts: (id: string) =>
    prisma.verification.update({ where: { id }, data: { attempts: { increment: 1 } } }),

  invalidateAllForPurpose: (accountId: string, purpose: VerificationPurpose) =>
    prisma.verification.updateMany({ where: { accountId, purpose, consumed: false }, data: { consumed: true } })
};
