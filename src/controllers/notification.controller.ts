import { Response } from 'express';
import notificationService from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest } from '../types';

export class NotificationController {
  async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const notifications = await notificationService.getUserNotifications(userId);
      return sendSuccess(res, notifications);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch notifications', 400);
    }
  }

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      await notificationService.markAsRead(id, userId);
      return sendSuccess(res, null, 'Notification marked as read');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to mark notification as read', 400);
    }
  }

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      await notificationService.markAllAsRead(userId);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to mark all notifications as read', 400);
    }
  }
}

export default new NotificationController();
