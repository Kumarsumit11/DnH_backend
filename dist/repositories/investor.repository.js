"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investorRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.investorRepository = {
    findByAccountId: (accountId) => prisma_1.prisma.investorProfile.findUnique({ where: { accountId } }),
    findById: (id) => prisma_1.prisma.investorProfile.findUnique({ where: { id }, include: { account: true } }),
    update: (accountId, data) => prisma_1.prisma.investorProfile.update({ where: { accountId }, data }),
    updateAvatar: (accountId, avatarUrl) => prisma_1.prisma.investorProfile.update({ where: { accountId }, data: { avatarUrl } })
};
