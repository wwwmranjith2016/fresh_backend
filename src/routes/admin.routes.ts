import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/orders', orderController.getAllOrders.bind(orderController));
router.get('/orders/:id', orderController.getOrderByIdAdmin.bind(orderController));
router.put('/orders/:id/status', orderController.updateOrderStatus.bind(orderController));
router.get('/dashboard/stats', orderController.getDashboardStats.bind(orderController));

export default router;
