import { notificationRepository } from '../repositories/notification.repository';

export const notificationService = {
  list: (accountId: string, unreadOnly: boolean) => notificationRepository.listByAccount(accountId, unreadOnly),
  markRead: (id: string) => notificationRepository.markRead(id),
  markAllRead: (accountId: string) => notificationRepository.markAllRead(accountId)
};
