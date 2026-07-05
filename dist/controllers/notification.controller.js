"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const notification_service_1 = require("../services/notification.service");
exports.notificationController = {
    list: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const unreadOnly = req.query.unreadOnly === 'true';
        const notifications = await notification_service_1.notificationService.list(req.account.id, unreadOnly);
        (0, apiResponse_1.sendSuccess)(res, notifications);
    }),
    markRead: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const notification = await notification_service_1.notificationService.markRead(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, notification, 'Notification marked as read');
    }),
    markAllRead: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await notification_service_1.notificationService.markAllRead(req.account.id);
        (0, apiResponse_1.sendSuccess)(res, {}, 'All notifications marked as read');
    })
};
