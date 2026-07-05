"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
exports.documentRepository = {
    create: (accountId, type, fileName, fileUrl, mimeType, sizeBytes, bucket) => prisma_1.prisma.document.create({ data: { accountId, type, fileName, fileUrl, mimeType, sizeBytes, bucket } }),
    listByAccount: (accountId) => prisma_1.prisma.document.findMany({ where: { accountId }, orderBy: { createdAt: 'desc' } }),
    findById: (id) => prisma_1.prisma.document.findUnique({ where: { id } }),
    listPending: () => prisma_1.prisma.document.findMany({ where: { status: client_1.DocumentStatus.PENDING }, include: { account: true } }),
    updateStatus: (id, status, reviewedBy, rejectionReason) => prisma_1.prisma.document.update({ where: { id }, data: { status, reviewedBy, rejectionReason } }),
    delete: (id) => prisma_1.prisma.document.delete({ where: { id } })
};
