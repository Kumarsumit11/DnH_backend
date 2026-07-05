"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.refreshTokenRepository = {
    create: (accountId, tokenHash, expiresAt, userAgent, ipAddress) => prisma_1.prisma.refreshToken.create({ data: { accountId, tokenHash, expiresAt, userAgent, ipAddress } }),
    findValidByAccountId: (accountId) => prisma_1.prisma.refreshToken.findMany({
        where: { accountId, revoked: false, expiresAt: { gt: new Date() } }
    }),
    revoke: (id) => prisma_1.prisma.refreshToken.update({ where: { id }, data: { revoked: true } }),
    revokeAllForAccount: (accountId) => prisma_1.prisma.refreshToken.updateMany({ where: { accountId }, data: { revoked: true } })
};
