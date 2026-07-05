import { prisma } from '../config/prisma';

export const refreshTokenRepository = {
  create: (accountId: string, tokenHash: string, expiresAt: Date, userAgent?: string, ipAddress?: string) =>
    prisma.refreshToken.create({ data: { accountId, tokenHash, expiresAt, userAgent, ipAddress } }),

  findValidByAccountId: (accountId: string) =>
    prisma.refreshToken.findMany({
      where: { accountId, revoked: false, expiresAt: { gt: new Date() } }
    }),

  revoke: (id: string) => prisma.refreshToken.update({ where: { id }, data: { revoked: true } }),

  revokeAllForAccount: (accountId: string) =>
    prisma.refreshToken.updateMany({ where: { accountId }, data: { revoked: true } })
};
