import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { Role, AccountStatus } from '@prisma/client';

function generatePassword(): string {
  // 12 chars, mixed — readable enough to hand over, strong enough to keep.
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
  let pwd = '';
  const bytes = crypto.randomBytes(12);
  for (let i = 0; i < 12; i++) {
    pwd += chars[bytes[i] % chars.length];
  }
  return pwd;
}

export const associateAdminService = {
  async createAssociate(email: string, fullName: string, department?: string) {
    const existing = await prisma.account.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const plainPassword = generatePassword();
    const passwordHash = await bcrypt.hash(plainPassword, 10);

    const account = await prisma.account.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: Role.ASSOCIATE_PARTNER,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
        associatePartnerProfile: {
          create: {
            fullName,
            department
          }
        }
      },
      include: { associatePartnerProfile: true }
    });

    return {
      id: account.id,
      email: account.email,
      password: plainPassword, // returned once — not stored anywhere in plaintext
      fullName: account.associatePartnerProfile?.fullName,
      department: account.associatePartnerProfile?.department
    };
  },

  async listAssociates() {
    const accounts = await prisma.account.findMany({
      where: { role: Role.ASSOCIATE_PARTNER },
      include: { associatePartnerProfile: true },
      orderBy: { createdAt: 'desc' }
    });

    return accounts.map((a) => ({
      id: a.id,
      email: a.email,
      status: a.status,
      fullName: a.associatePartnerProfile?.fullName ?? null,
      department: a.associatePartnerProfile?.department ?? null,
      createdAt: a.createdAt
    }));
  }
};
