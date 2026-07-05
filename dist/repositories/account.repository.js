"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
exports.accountRepository = {
    findByEmail: (email) => prisma_1.prisma.account.findUnique({ where: { email } }),
    findById: (id) => prisma_1.prisma.account.findUnique({
        where: { id },
        include: { investorProfile: true, companyProfile: true, associatePartnerProfile: true }
    }),
    createInvestor: (email, passwordHash, fullName, phone, address) => prisma_1.prisma.account.create({
        data: {
            email,
            passwordHash,
            phone,
            role: client_1.Role.INVESTOR,
            investorProfile: { create: { fullName, address } }
        },
        include: { investorProfile: true }
    }),
    createCompany: (email, passwordHash, companyName, phone, address) => prisma_1.prisma.account.create({
        data: {
            email,
            passwordHash,
            phone,
            role: client_1.Role.COMPANY,
            companyProfile: { create: { companyName, address } }
        },
        include: { companyProfile: true }
    }),
    createAssociatePartner: (email, passwordHash, fullName) => prisma_1.prisma.account.create({
        data: {
            email,
            passwordHash,
            role: client_1.Role.ASSOCIATE_PARTNER,
            associatePartnerProfile: { create: { fullName } }
        },
        include: { associatePartnerProfile: true }
    }),
    markEmailVerified: (id) => prisma_1.prisma.account.update({ where: { id }, data: { isEmailVerified: true, status: client_1.AccountStatus.ACTIVE } }),
    updatePassword: (id, passwordHash) => prisma_1.prisma.account.update({ where: { id }, data: { passwordHash } }),
    updateStatus: (id, status) => prisma_1.prisma.account.update({ where: { id }, data: { status } }),
    delete: (id) => prisma_1.prisma.account.delete({ where: { id } })
};
