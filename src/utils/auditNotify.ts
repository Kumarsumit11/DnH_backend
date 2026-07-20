import { prisma } from '../repositories/financialAnalysis.repository';

/**
 * String unions mirroring your schema's enums (AuditAction, NotificationType).
 * Kept as local literal types — like the rest of this module — so nothing
 * here depends on `npx prisma generate` having been run yet. Once your
 * Prisma client is regenerated with these models, feel free to swap these
 * for `import type { AuditAction, NotificationType } from '@prisma/client'`.
 */
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT' | 'LOGIN' | 'LOGOUT';
export type NotificationType = 'ACCOUNT' | 'FUNDING' | 'PROPOSAL' | 'INVESTMENT' | 'DOCUMENT' | 'SYSTEM';

export interface AuditNotifyParams {
  /** The admin account performing the action. Pass null if you haven't wired req.user yet. */
  actorAccountId?: string | null;
  action: AuditAction;
  /** e.g. 'CompanyProfile' | 'InvestorProfile' | 'Document' */
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  /** Optional: fire a Notification to the account whose entity was acted on. */
  notify?: {
    accountId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  };
}

/**
 * Writes one AuditLog row (who did what, to what, when) and, if `notify` is
 * given, one Notification row (what the affected user sees in their inbox).
 * Call this from every admin approve/reject action so there's a durable
 * trail — this is required for compliance in a funding/investment platform.
 */
export async function recordAuditAndNotify(params: AuditNotifyParams): Promise<void> {
  await prisma.auditLog.create({
    data: {
      accountId: params.actorAccountId ?? null,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: (params.metadata ?? undefined) as never,
      ipAddress: params.ipAddress ?? null,
    },
  });

  if (params.notify) {
    await prisma.notification.create({
      data: {
        accountId: params.notify.accountId,
        type: params.notify.type,
        title: params.notify.title,
        message: params.notify.message,
        metadata: (params.notify.metadata ?? undefined) as never,
      },
    });
  }
}
