"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.notificationRepository = {
    create: (accountId, type, title, message, metadata) => prisma_1.prisma.notification.create({ data: { accountId, type, title, message, metadata } }),
    listByAccount: (accountId, unreadOnly = false) => prisma_1.prisma.notification.findMany({
        where: { accountId, ...(unreadOnly ? { isRead: false } : {}) },
        orderBy: { createdAt: 'desc' }
    }),
    markRead: (id) => prisma_1.prisma.notification.update({ where: { id }, data: { isRead: true } }),
    markAllRead: (accountId) => prisma_1.prisma.notification.updateMany({ where: { accountId, isRead: false }, data: { isRead: true } })
};
