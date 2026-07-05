"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificationRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.verificationRepository = {
    create: (accountId, purpose, codeHash, expiresAt) => prisma_1.prisma.verification.create({ data: { accountId, purpose, codeHash, expiresAt } }),
    findLatestActive: (accountId, purpose) => prisma_1.prisma.verification.findFirst({
        where: { accountId, purpose, consumed: false, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' }
    }),
    markConsumed: (id) => prisma_1.prisma.verification.update({ where: { id }, data: { consumed: true } }),
    incrementAttempts: (id) => prisma_1.prisma.verification.update({ where: { id }, data: { attempts: { increment: 1 } } }),
    invalidateAllForPurpose: (accountId, purpose) => prisma_1.prisma.verification.updateMany({ where: { accountId, purpose, consumed: false }, data: { consumed: true } })
};
