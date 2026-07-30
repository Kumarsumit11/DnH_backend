import { prisma } from '../config/prisma';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../constants/errorCodes';
import { DocumentStatus, NotificationType, VerificationStatus, FundingStatus } from '@prisma/client';

const toNumber = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));

export const associateService = {
  // ---------------- Dashboard ----------------
  async getDashboardStats() {
    const [
      totalCompanies,
      totalInvestors,
      verifiedCompanies,
      pendingCompanyVerification,
      pendingDocuments,
      activeFunding,
      recentActivity
    ] = await Promise.all([
      prisma.companyProfile.count(),
      prisma.investorProfile.count(),
      prisma.companyProfile.count({ where: { verificationStatus: VerificationStatus.VERIFIED } }),
      prisma.companyProfile.count({ where: { verificationStatus: VerificationStatus.PENDING } }),
      prisma.document.count({ where: { status: DocumentStatus.PENDING } }),
      prisma.fundingOpportunity.findMany({
        where: { status: FundingStatus.ACTIVE },
        select: { fundNeeded: true }
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15,
        include: { account: { select: { email: true, role: true } } }
      })
    ]);

    const totalFundingRequired = await prisma.fundingOpportunity.aggregate({
      _sum: { fundNeeded: true }
    });

    const totalActiveFunding = activeFunding.reduce((sum, f) => sum + toNumber(f.fundNeeded), 0);

    return {
      totalCompanies,
      totalInvestors,
      totalFundingRequired: toNumber(totalFundingRequired._sum.fundNeeded),
      totalActiveFunding,
      pendingDocuments,
      pendingCompanyVerification,
      verifiedCompanies,
      recentActivity: recentActivity.map((a) => ({
        id: a.id,
        action: a.action,
        description: a.description,
        actorEmail: a.account?.email ?? null,
        actorRole: a.account?.role ?? null,
        createdAt: a.createdAt
      }))
    };
  },

  // ---------------- Companies ----------------
  async listCompanies() {
    const companies = await prisma.companyProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        account: { select: { email: true } },
        fundingOpportunities: { select: { fundNeeded: true, status: true } }
      }
    });

    return companies.map((c) => ({
      id: c.id,
      companyName: c.companyName,
      industry: c.industry,
      ceoName: c.ceoName,
      cfoName: c.cfoName,
      email: c.account.email,
      verificationStatus: c.verificationStatus,
      fundingNeeded: c.fundingOpportunities.reduce((sum, f) => sum + toNumber(f.fundNeeded), 0)
    }));
  },

  async getCompanyDetail(companyId: string) {
    const company = await prisma.companyProfile.findUnique({
      where: { id: companyId },
      include: {
        account: { select: { email: true, phone: true } },
        fundingOpportunities: { orderBy: { createdAt: 'desc' } },
        financialAnalyses: { orderBy: [{ financialYear: 'desc' }, { month: 'desc' } ] }
      }
    });

    if (!company) {
      throw AppError.notFound('Company not found', ErrorCode.NOT_FOUND);
    }

    const documents = await prisma.document.findMany({
      where: { accountId: company.accountId },
      orderBy: { createdAt: 'desc' }
    });

    return {
      id: company.id,
      companyName: company.companyName,
      industry: company.industry,
      description: company.description,
      website: company.website,
      ceoName: company.ceoName,
      cfoName: company.cfoName,
      email: company.account.email,
      phone: company.account.phone,
      monthlyRevenue: toNumber(company.monthlyRevenue),
      yearlyRevenue: toNumber(company.yearlyRevenue),
      verificationStatus: company.verificationStatus,
      informationMemo: company.informationMemo,
      fundingOpportunities: company.fundingOpportunities.map((f) => ({
        id: f.id,
        title: f.title,
        fundNeeded: toNumber(f.fundNeeded),
        valuation: toNumber(f.valuation),
        equityOfferedPct: toNumber(f.equityOfferedPct),
        status: f.status,
        createdAt: f.createdAt
      })),
      financialAnalyses: company.financialAnalyses.map((f) => ({
        id: f.id,
        financialYear: f.financialYear,
        month: f.month,
        revenue: f.revenue,
        grossProfit: f.grossProfit,
        netProfitBeforeTax: f.netProfitBeforeTax
      })),
      documents: documents.map((d) => ({
        id: d.id,
        type: d.type,
        status: d.status,
        fileName: d.fileName,
        fileUrl: d.fileUrl,
        createdAt: d.createdAt
      }))
    };
  },

  // ---------------- Documents ----------------
  async listDocuments(status?: DocumentStatus) {
    const documents = await prisma.document.findMany({
      where: {
        ...(status ? { status } : {}),
        account: { companyProfile: { isNot: null } }
      },
      orderBy: { createdAt: 'desc' },
      include: { account: { include: { companyProfile: { select: { companyName: true } } } } }
    });

    return documents.map((d) => ({
      id: d.id,
      type: d.type,
      status: d.status,
      fileName: d.fileName,
      fileUrl: d.fileUrl,
      companyName: d.account.companyProfile?.companyName ?? null,
      rejectionReason: d.rejectionReason,
      createdAt: d.createdAt
    }));
  },

  async reviewDocument(
    documentId: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    reviewerId: string,
    rejectionReason?: string
  ) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      throw AppError.notFound('Document not found', ErrorCode.NOT_FOUND);
    }

    const status = action === 'APPROVE' ? DocumentStatus.VERIFIED : DocumentStatus.REJECTED;

    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        reviewedBy: reviewerId,
        rejectionReason: action === 'APPROVE' ? null : rejectionReason
      }
    });

    await prisma.notification.create({
      data: {
        accountId: document.accountId,
        type: NotificationType.DOCUMENT,
        title: action === 'APPROVE' ? 'Document approved' : 'Document needs attention',
        message:
          action === 'APPROVE'
            ? `Your document "${document.fileName}" has been verified.`
            : `Your document "${document.fileName}" was ${action === 'REJECT' ? 'rejected' : 'sent back for changes'}: ${rejectionReason ?? ''}`
      }
    });

    return updated;
  },

  // ---------------- Funding ----------------
  async listFunding() {
    const funding = await prisma.fundingOpportunity.findMany({
      orderBy: { createdAt: 'desc' },
      include: { company: { select: { companyName: true } } }
    });

    return funding.map((f) => ({
      id: f.id,
      companyName: f.company.companyName,
      fundNeeded: toNumber(f.fundNeeded),
      valuation: toNumber(f.valuation),
      equityOfferedPct: toNumber(f.equityOfferedPct),
      status: f.status,
      createdAt: f.createdAt
    }));
  },

  // ---------------- Messages ----------------
  async listMessages(accountId: string, threadWith?: string) {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: accountId, ...(threadWith ? { receiverId: threadWith } : {}) },
          { receiverId: accountId, ...(threadWith ? { senderId: threadWith } : {}) }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { email: true, role: true } },
        receiver: { select: { email: true, role: true } }
      }
    });

    return messages.map((m) => ({
      id: m.id,
      senderId: m.senderId,
      senderEmail: m.sender.email,
      receiverId: m.receiverId,
      receiverEmail: m.receiver.email,
      subject: m.subject,
      content: m.content,
      isRead: m.isRead,
      createdAt: m.createdAt
    }));
  },

  async sendMessage(senderId: string, receiverId: string, content: string, subject?: string) {
    const receiver = await prisma.account.findUnique({ where: { id: receiverId } });
    if (!receiver) {
      throw AppError.notFound('Recipient not found', ErrorCode.NOT_FOUND);
    }

    const message = await prisma.message.create({
      data: { senderId, receiverId, content, subject }
    });

    await prisma.notification.create({
      data: {
        accountId: receiverId,
        type: NotificationType.SYSTEM,
        title: 'New message',
        message: subject ? `New message: ${subject}` : 'You have a new message'
      }
    });

    return message;
  },

  // ---------------- Profile ----------------
  async getProfile(accountId: string) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { associatePartnerProfile: true }
    });

    if (!account || !account.associatePartnerProfile) {
      throw AppError.notFound('Associate profile not found', ErrorCode.NOT_FOUND);
    }

    return {
      fullName: account.associatePartnerProfile.fullName,
      department: account.associatePartnerProfile.department,
      email: account.email,
      role: account.role,
      createdAt: account.createdAt
    };
  }
};
