import { prisma } from '../config/prisma';
import { Role, AccountStatus } from '@prisma/client';

export const accountRepository = {
  findByEmail: (email: string) => prisma.account.findUnique({ where: { email } }),

  findById: (id: string) =>
    prisma.account.findUnique({
      where: { id },
      include: { investorProfile: true, companyProfile: true, associatePartnerProfile: true }
    }),

  createInvestor: (email: string, passwordHash: string, fullName: string, phone?: string, address?: string) =>
    prisma.account.create({
      data: {
        email,
        passwordHash,
        phone,
        role: Role.INVESTOR,
        investorProfile: { create: { fullName, address } }
      },
      include: { investorProfile: true }
    }),

  createCompany: (email: string, passwordHash: string, companyName: string, phone?: string, address?: string) =>
    prisma.account.create({
      data: {
        email,
        passwordHash,
        phone,
        role: Role.COMPANY,
        companyProfile: { create: { companyName, address } }
      },
      include: { companyProfile: true }
    }),

  createAssociatePartner: (email: string, passwordHash: string, fullName: string) =>
    prisma.account.create({
      data: {
        email,
        passwordHash,
        role: Role.ASSOCIATE_PARTNER,
        associatePartnerProfile: { create: { fullName } }
      },
      include: { associatePartnerProfile: true }
    }),

  markEmailVerified: (id: string) =>
    prisma.account.update({ where: { id }, data: { isEmailVerified: true, status: AccountStatus.ACTIVE } }),

  updatePassword: (id: string, passwordHash: string) =>
    prisma.account.update({ where: { id }, data: { passwordHash } }),

  updateStatus: (id: string, status: AccountStatus) => prisma.account.update({ where: { id }, data: { status } }),

  delete: (id: string) => prisma.account.delete({ where: { id } })
};
