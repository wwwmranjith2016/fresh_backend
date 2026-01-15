import { Router } from 'express';
import authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/refresh', authController.refreshToken.bind(authController));
router.post('/logout', authMiddleware, authController.logout.bind(authController));
router.put('/fcm-token', authMiddleware, authController.updateFcmToken.bind(authController));
router.get('/user/:phone', authController.getUserByPhone.bind(authController));
router.get('/latest-customer', authController.getLatestCustomer.bind(authController));

export default router;
