import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';

export const companyUpdateRepository = {
  create: (companyId: string, data: Prisma.CompanyUpdateCreateWithoutCompanyInput) =>
    prisma.companyUpdate.create({ data: { ...data, companyId } }),

  findById: (id: string) => prisma.companyUpdate.findUnique({ where: { id } }),

  listByCompanyId: (companyId: string) =>
    prisma.companyUpdate.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } }),

  update: (id: string, data: Prisma.CompanyUpdateUpdateInput) =>
    prisma.companyUpdate.update({ where: { id }, data }),

  delete: (id: string) => prisma.companyUpdate.delete({ where: { id } })
};