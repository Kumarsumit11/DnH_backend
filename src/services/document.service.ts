import { documentRepository } from '../repositories/document.repository';
import { storageService } from '../storage/storage.service';
import { AppError } from '../errors/AppError';
import { DocumentType, DocumentStatus } from '@prisma/client';
import { notificationRepository } from '../repositories/notification.repository';

const TYPE_TO_BUCKET: Record<DocumentType, string> = {
  KYC: 'kyc',
  PITCH_DECK: 'pitch-decks',
  COMPANY_REGISTRATION: 'company-documents',
  FINANCIAL_STATEMENT: 'company-documents',
  LOGO: 'logos',
  AVATAR: 'avatars',
  OTHER: 'investor-documents'
};

export const documentService = {
  async upload(accountId: string, type: DocumentType, file: Express.Multer.File) {
    const bucket = TYPE_TO_BUCKET[type];
    const result = await storageService.uploadFile(bucket, accountId, file);
    return documentRepository.create(accountId, type, file.originalname, result.publicUrl, file.mimetype, file.size, bucket);
  },

  async listOwn(accountId: string) {
    return documentRepository.listByAccount(accountId);
  },

  async listPending() {
    return documentRepository.listPending();
  },

  async review(reviewerAccountId: string, documentId: string, status: 'VERIFIED' | 'REJECTED', rejectionReason?: string) {
    const document = await documentRepository.findById(documentId);
    if (!document) throw AppError.notFound('Document not found');

    const updated = await documentRepository.updateStatus(documentId, status as DocumentStatus, reviewerAccountId, rejectionReason);

    await notificationRepository.create(
      document.accountId,
      'DOCUMENT',
      `Document ${status.toLowerCase()}`,
      `Your document "${document.fileName}" was ${status.toLowerCase()}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`
    );

    return updated;
  },

  async delete(accountId: string, documentId: string) {
    const document = await documentRepository.findById(documentId);
    if (!document) throw AppError.notFound('Document not found');
    if (document.accountId !== accountId) throw AppError.forbidden('Not authorized to delete this document');

    await storageService.deleteFile(document.bucket, document.fileUrl);
    return documentRepository.delete(documentId);
  }
};
