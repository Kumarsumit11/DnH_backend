"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.auditRepository = {
    log: (action, entityType, entityId, accountId, metadata, ipAddress) => prisma_1.prisma.auditLog.create({ data: { action, entityType, entityId, accountId, metadata, ipAddress } }),
    logActivity: (accountId, action, description, metadata) => prisma_1.prisma.activityLog.create({ data: { accountId, action, description, metadata } }),
    listActivityForAccount: (accountId) => prisma_1.prisma.activityLog.findMany({ where: { accountId }, orderBy: { createdAt: 'desc' }, take: 100 })
};
