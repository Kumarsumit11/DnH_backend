import { prisma } from '../config/prisma';
import { DocumentStatus, DocumentType } from '@prisma/client';

export const documentRepository = {
  create: (
    accountId: string,
    type: DocumentType,
    fileName: string,
    fileUrl: string,
    mimeType: string,
    sizeBytes: number,
    bucket: string
  ) => prisma.document.create({ data: { accountId, type, fileName, fileUrl, mimeType, sizeBytes, bucket } }),

  listByAccount: (accountId: string) =>
    prisma.document.findMany({ where: { accountId }, orderBy: { createdAt: 'desc' } }),

  findById: (id: string) => prisma.document.findUnique({ where: { id } }),

  listPending: () =>
    prisma.document.findMany({ where: { status: DocumentStatus.PENDING }, include: { account: true } }),

  updateStatus: (id: string, status: DocumentStatus, reviewedBy: string, rejectionReason?: string) =>
    prisma.document.update({ where: { id }, data: { status, reviewedBy, rejectionReason } }),

  delete: (id: string) => prisma.document.delete({ where: { id } })
};
