import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { notificationService } from '../services/notification.service';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await notificationService.list(req.account!.id, unreadOnly);
    sendSuccess(res, notifications);
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.params.id);
    sendSuccess(res, notification, 'Notification marked as read');
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.account!.id);
    sendSuccess(res, {}, 'All notifications marked as read');
  })
};
