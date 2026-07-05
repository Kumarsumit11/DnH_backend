"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const notification_repository_1 = require("../repositories/notification.repository");
exports.notificationService = {
    list: (accountId, unreadOnly) => notification_repository_1.notificationRepository.listByAccount(accountId, unreadOnly),
    markRead: (id) => notification_repository_1.notificationRepository.markRead(id),
    markAllRead: (accountId) => notification_repository_1.notificationRepository.markAllRead(accountId)
};
