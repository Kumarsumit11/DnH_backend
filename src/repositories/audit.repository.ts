import { prisma } from '../config/prisma';
import { AuditAction, Prisma } from '@prisma/client';

export const auditRepository = {
  log: (
    action: AuditAction,
    entityType: string,
    entityId?: string,
    accountId?: string,
    metadata?: Prisma.InputJsonValue,
    ipAddress?: string
  ) => prisma.auditLog.create({ data: { action, entityType, entityId, accountId, metadata, ipAddress } }),

  logActivity: (accountId: string, action: string, description: string, metadata?: Prisma.InputJsonValue) =>
    prisma.activityLog.create({ data: { accountId, action, description, metadata } }),

  listActivityForAccount: (accountId: string) =>
    prisma.activityLog.findMany({ where: { accountId }, orderBy: { createdAt: 'desc' }, take: 100 })
};
