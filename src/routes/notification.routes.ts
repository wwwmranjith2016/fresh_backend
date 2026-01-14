import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, notificationController.getUserNotifications.bind(notificationController));
router.put('/:id/read', authMiddleware, notificationController.markAsRead.bind(notificationController));
router.put('/read-all', authMiddleware, notificationController.markAllAsRead.bind(notificationController));

export default router;
