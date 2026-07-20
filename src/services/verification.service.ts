import { verificationRepository } from '../repositories/adminVerification.repository';
import { recordAuditAndNotify } from '../utils/auditNotify';
import { NotFoundError } from '../utils/errors';
import type { VerificationDecisionInput } from '../validators/verification.validator';

export interface ActorContext {
  /** Admin account id performing the action, once you wire req.user in. */
  adminAccountId?: string | null;
  ipAddress?: string | null;
}

export const verificationService = {
  // -------------------------------------------------------------------------
  // Company
  // -------------------------------------------------------------------------

  async decideCompanyVerification(companyId: string, decision: VerificationDecisionInput, actor: ActorContext) {
    const company = await verificationRepository.findCompanyWithAccount(companyId);
    if (!company) throw new NotFoundError('Company not found');

    const status = decision.action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';
    const rejectionReason = decision.action === 'REJECT' ? decision.rejectionReason ?? null : null;

    const updated = await verificationRepository.setCompanyVerificationStatus(companyId, status, rejectionReason);

    await recordAuditAndNotify({
      actorAccountId: actor.adminAccountId,
      action: decision.action === 'VERIFY' ? 'APPROVE' : 'REJECT',
      entityType: 'CompanyProfile',
      entityId: companyId,
      ipAddress: actor.ipAddress,
      metadata: { companyName: company.companyName, rejectionReason },
      notify: {
        accountId: company.accountId,
        type: 'ACCOUNT',
        title: decision.action === 'VERIFY' ? 'Company verified' : 'Company verification rejected',
        message:
          decision.action === 'VERIFY'
            ? `Your company "${company.companyName}" has been verified. You can now publish funding opportunities.`
            : `Your company "${company.companyName}" verification was rejected: ${rejectionReason}`,
      },
    });

    return {
      id: updated.id,
      companyName: company.companyName,
      verificationStatus: updated.verificationStatus,
      rejectionReason: updated.rejectionReason,
    };
  },

  // -------------------------------------------------------------------------
  // Investor
  // -------------------------------------------------------------------------

  async listInvestors({ page, limit, verificationStatus, search }: {
    page: number;
    limit: number;
    verificationStatus?: string;
    search?: string;
  }) {
    const skip = (page - 1) * limit;
    const { investors, total } = await verificationRepository.findAllInvestors({
      skip,
      take: limit,
      verificationStatus,
      search,
    });

    return {
      investors: investors.map((inv) => ({
        id: inv.id,
        fullName: inv.fullName,
        email: inv.account?.email ?? '',
        verificationStatus: inv.verificationStatus,
        createdAt: inv.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async decideInvestorVerification(investorId: string, decision: VerificationDecisionInput, actor: ActorContext) {
    const investor = await verificationRepository.findInvestorWithAccount(investorId);
    if (!investor) throw new NotFoundError('Investor not found');

    const status = decision.action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';
    const rejectionReason = decision.action === 'REJECT' ? decision.rejectionReason ?? null : null;

    const updated = await verificationRepository.setInvestorVerificationStatus(investorId, status);

    await recordAuditAndNotify({
      actorAccountId: actor.adminAccountId,
      action: decision.action === 'VERIFY' ? 'APPROVE' : 'REJECT',
      entityType: 'InvestorProfile',
      entityId: investorId,
      ipAddress: actor.ipAddress,
      // rejectionReason isn't a column on InvestorProfile yet (see repository note),
      // so it's preserved here in the audit trail even though it won't show on the row.
      metadata: { fullName: investor.fullName, rejectionReason },
      notify: {
        accountId: investor.accountId,
        type: 'ACCOUNT',
        title: decision.action === 'VERIFY' ? 'Profile verified' : 'Verification rejected',
        message:
          decision.action === 'VERIFY'
            ? `Your investor profile has been verified. You can now submit investment proposals.`
            : `Your investor profile verification was rejected: ${rejectionReason}`,
      },
    });

    return {
      id: updated.id,
      fullName: investor.fullName,
      verificationStatus: updated.verificationStatus,
    };
  },

  // -------------------------------------------------------------------------
  // Documents
  // -------------------------------------------------------------------------

  async listDocuments({ page, limit, status, type, accountId }: {
    page: number;
    limit: number;
    status?: string;
    type?: string;
    accountId?: string;
  }) {
    const skip = (page - 1) * limit;
    const { documents, total } = await verificationRepository.findAllDocuments({
      skip,
      take: limit,
      status,
      type,
      accountId,
    });

    return {
      documents: documents.map((doc) => ({
        id: doc.id,
        accountId: doc.accountId,
        ownerEmail: doc.account?.email ?? '',
        ownerRole: doc.account?.role ?? null,
        ownerName: doc.account?.companyProfile?.companyName ?? doc.account?.investorProfile?.fullName ?? null,
        type: doc.type,
        status: doc.status,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        mimeType: doc.mimeType,
        sizeBytes: doc.sizeBytes,
        rejectionReason: doc.rejectionReason,
        reviewedBy: doc.reviewedBy,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async decideDocumentReview(documentId: string, decision: VerificationDecisionInput, actor: ActorContext) {
    const document = await verificationRepository.findDocumentById(documentId);
    if (!document) throw new NotFoundError('Document not found');

    const status = decision.action === 'VERIFY' ? 'VERIFIED' : 'REJECTED';
    const rejectionReason = decision.action === 'REJECT' ? decision.rejectionReason ?? null : null;

    const updated = await verificationRepository.setDocumentStatus(
      documentId,
      status,
      rejectionReason,
      actor.adminAccountId ?? null
    );

    await recordAuditAndNotify({
      actorAccountId: actor.adminAccountId,
      action: decision.action === 'VERIFY' ? 'APPROVE' : 'REJECT',
      entityType: 'Document',
      entityId: documentId,
      ipAddress: actor.ipAddress,
      metadata: { fileName: document.fileName, rejectionReason },
      notify: {
        accountId: document.accountId,
        type: 'DOCUMENT',
        title: decision.action === 'VERIFY' ? 'Document verified' : 'Document rejected',
        message:
          decision.action === 'VERIFY'
            ? `Your document "${document.fileName}" has been verified.`
            : `Your document "${document.fileName}" was rejected: ${rejectionReason}`,
      },
    });

    return {
      id: updated.id,
      fileName: document.fileName,
      status: updated.status,
      rejectionReason: updated.rejectionReason,
      reviewedBy: updated.reviewedBy,
    };
  },
};
