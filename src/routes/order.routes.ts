import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/guest', orderController.createGuestOrder.bind(orderController));
router.post('/', authMiddleware, orderController.createOrder.bind(orderController));
router.get('/', authMiddleware, orderController.getUserOrders.bind(orderController));
router.get('/:id', authMiddleware, orderController.getOrderById.bind(orderController));
router.put('/:id/cancel', authMiddleware, orderController.cancelOrder.bind(orderController));

export default router;
