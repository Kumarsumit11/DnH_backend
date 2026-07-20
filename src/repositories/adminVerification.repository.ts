import { prisma } from './financialAnalysis.repository';

// ---------------------------------------------------------------------------
// Shapes returned by this repository. Declared explicitly (rather than
// relying on Prisma's inferred payload types) because, like the rest of
// this module, `prisma.companyProfile` / `investorProfile` / `document`
// won't type-check as real models until you've merged the schema and run
// `npx prisma generate` — see README. Once generated, these can be swapped
// for Prisma's own payload types if you prefer.
// ---------------------------------------------------------------------------

export interface CompanyWithAccountRow {
  id: string;
  companyName: string;
  verificationStatus: string;
  accountId: string;
  account: { email: string } | null;
}

export interface InvestorListRow {
  id: string;
  fullName: string;
  verificationStatus: string;
  createdAt: Date;
  accountId: string;
  account: { email: string } | null;
}

export interface InvestorWithAccountRow {
  id: string;
  fullName: string;
  verificationStatus: string;
  accountId: string;
  account: { email: string } | null;
}

export interface DocumentListRow {
  id: string;
  accountId: string;
  type: string;
  status: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  bucket: string;
  rejectionReason: string | null;
  reviewedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  account: {
    email: string;
    role: string;
    companyProfile: { companyName: string } | null;
    investorProfile: { fullName: string } | null;
  } | null;
}

export interface DocumentDetailRow {
  id: string;
  accountId: string;
  type: string;
  status: string;
  fileName: string;
  fileUrl: string;
  rejectionReason: string | null;
  account: { email: string } | null;
}

// ---------------------------------------------------------------------------
// Company verification
// ---------------------------------------------------------------------------

export const verificationRepository = {
  async findCompanyWithAccount(companyId: string): Promise<CompanyWithAccountRow | null> {
    return prisma.companyProfile.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        companyName: true,
        verificationStatus: true,
        accountId: true,
        account: { select: { email: true } },
      },
    }) as unknown as Promise<CompanyWithAccountRow | null>;
  },

  async setCompanyVerificationStatus(
    companyId: string,
    status: 'VERIFIED' | 'REJECTED',
    rejectionReason: string | null
  ): Promise<{ id: string; verificationStatus: string; rejectionReason: string | null }> {
    return prisma.companyProfile.update({
      where: { id: companyId },
      data: {
        verificationStatus: status,
        // Clear any stale rejection reason on approval.
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
    }) as unknown as Promise<{ id: string; verificationStatus: string; rejectionReason: string | null }>;
  },

  // -------------------------------------------------------------------------
  // Investor verification
  // -------------------------------------------------------------------------

  async findAllInvestors({
    skip,
    take,
    verificationStatus,
    search,
  }: {
    skip: number;
    take: number;
    verificationStatus?: string;
    search?: string;
  }): Promise<{ investors: InvestorListRow[]; total: number }> {
    const where = {
      ...(verificationStatus ? { verificationStatus } : {}),
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: 'insensitive' as const } },
              { account: { email: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [investors, total] = await Promise.all([
      prisma.investorProfile.findMany({
        where,
        select: {
          id: true,
          fullName: true,
          verificationStatus: true,
          createdAt: true,
          accountId: true,
          account: { select: { email: true } },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<InvestorListRow[]>,
      prisma.investorProfile.count({ where }) as unknown as Promise<number>,
    ]);

    return { investors, total };
  },

  async findInvestorWithAccount(investorId: string): Promise<InvestorWithAccountRow | null> {
    return prisma.investorProfile.findUnique({
      where: { id: investorId },
      select: {
        id: true,
        fullName: true,
        verificationStatus: true,
        accountId: true,
        account: { select: { email: true } },
      },
    }) as unknown as Promise<InvestorWithAccountRow | null>;
  },

  /**
   * NOTE: your InvestorProfile model (unlike CompanyProfile) has no
   * `rejectionReason` column. We still accept and audit-log the reason so
   * nothing is lost, but it won't persist on the row itself. Recommended
   * schema addition:
   *   model InvestorProfile {
   *     ...
   *     rejectionReason String?
   *   }
   * Once added, mirror setCompanyVerificationStatus's `data` shape here.
   */
  async setInvestorVerificationStatus(
    investorId: string,
    status: 'VERIFIED' | 'REJECTED'
  ): Promise<{ id: string; verificationStatus: string }> {
    return prisma.investorProfile.update({
      where: { id: investorId },
      data: { verificationStatus: status },
    }) as unknown as Promise<{ id: string; verificationStatus: string }>;
  },

  // -------------------------------------------------------------------------
  // Documents
  // -------------------------------------------------------------------------

  async findAllDocuments({
    skip,
    take,
    status,
    type,
    accountId,
  }: {
    skip: number;
    take: number;
    status?: string;
    type?: string;
    accountId?: string;
  }): Promise<{ documents: DocumentListRow[]; total: number }> {
    const where = {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
      ...(accountId ? { accountId } : {}),
    };

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        select: {
          id: true,
          accountId: true,
          type: true,
          status: true,
          fileName: true,
          fileUrl: true,
          mimeType: true,
          sizeBytes: true,
          bucket: true,
          rejectionReason: true,
          reviewedBy: true,
          createdAt: true,
          updatedAt: true,
          account: {
            select: {
              email: true,
              role: true,
              companyProfile: { select: { companyName: true } },
              investorProfile: { select: { fullName: true } },
            },
          },
        },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }) as unknown as Promise<DocumentListRow[]>,
      prisma.document.count({ where }) as unknown as Promise<number>,
    ]);

    return { documents, total };
  },

  async findDocumentById(documentId: string): Promise<DocumentDetailRow | null> {
    return prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        accountId: true,
        type: true,
        status: true,
        fileName: true,
        fileUrl: true,
        rejectionReason: true,
        account: { select: { email: true } },
      },
    }) as unknown as Promise<DocumentDetailRow | null>;
  },

  async setDocumentStatus(
    documentId: string,
    status: 'VERIFIED' | 'REJECTED',
    rejectionReason: string | null,
    reviewedBy: string | null
  ): Promise<{ id: string; status: string; rejectionReason: string | null; reviewedBy: string | null }> {
    return prisma.document.update({
      where: { id: documentId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        reviewedBy,
      },
    }) as unknown as Promise<{ id: string; status: string; rejectionReason: string | null; reviewedBy: string | null }>;
  },
};
