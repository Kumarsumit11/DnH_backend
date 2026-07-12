import { prisma } from '../config/prisma';
import { NotificationType, Prisma } from '@prisma/client';

export const notificationRepository = {
  create: (accountId: string, type: NotificationType, title: string, message: string, metadata?: Prisma.InputJsonValue) =>
    prisma.notification.create({ data: { accountId, type, title, message, metadata } }),

  listByAccount: (accountId: string, unreadOnly = false) =>
    prisma.notification.findMany({
      where: { accountId, ...(unreadOnly ? { isRead: false } : {}) },
      orderBy: { createdAt: 'desc' }
    }),

  markRead: (id: string) => prisma.notification.update({ where: { id }, data: { isRead: true } }),

  markAllRead: (accountId: string) =>
    prisma.notification.updateMany({ where: { accountId, isRead: false }, data: { isRead: true } }),

  countUnread: (accountId: string) =>
    prisma.notification.count({ where: { accountId, isRead: false } })
};
