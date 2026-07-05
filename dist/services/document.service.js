"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentService = void 0;
const document_repository_1 = require("../repositories/document.repository");
const storage_service_1 = require("../storage/storage.service");
const AppError_1 = require("../errors/AppError");
const notification_repository_1 = require("../repositories/notification.repository");
const TYPE_TO_BUCKET = {
    KYC: 'kyc',
    PITCH_DECK: 'pitch-decks',
    COMPANY_REGISTRATION: 'company-documents',
    FINANCIAL_STATEMENT: 'company-documents',
    LOGO: 'logos',
    AVATAR: 'avatars',
    OTHER: 'investor-documents'
};
exports.documentService = {
    async upload(accountId, type, file) {
        const bucket = TYPE_TO_BUCKET[type];
        const result = await storage_service_1.storageService.uploadFile(bucket, accountId, file);
        return document_repository_1.documentRepository.create(accountId, type, file.originalname, result.publicUrl, file.mimetype, file.size, bucket);
    },
    async listOwn(accountId) {
        return document_repository_1.documentRepository.listByAccount(accountId);
    },
    async listPending() {
        return document_repository_1.documentRepository.listPending();
    },
    async review(reviewerAccountId, documentId, status, rejectionReason) {
        const document = await document_repository_1.documentRepository.findById(documentId);
        if (!document)
            throw AppError_1.AppError.notFound('Document not found');
        const updated = await document_repository_1.documentRepository.updateStatus(documentId, status, reviewerAccountId, rejectionReason);
        await notification_repository_1.notificationRepository.create(document.accountId, 'DOCUMENT', `Document ${status.toLowerCase()}`, `Your document "${document.fileName}" was ${status.toLowerCase()}.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`);
        return updated;
    },
    async delete(accountId, documentId) {
        const document = await document_repository_1.documentRepository.findById(documentId);
        if (!document)
            throw AppError_1.AppError.notFound('Document not found');
        if (document.accountId !== accountId)
            throw AppError_1.AppError.forbidden('Not authorized to delete this document');
        await storage_service_1.storageService.deleteFile(document.bucket, document.fileUrl);
        return document_repository_1.documentRepository.delete(documentId);
    }
};
