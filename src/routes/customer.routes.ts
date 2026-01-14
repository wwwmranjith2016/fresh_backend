import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getCustomerProfile, updateCustomerProfile } from '../controllers/customer.controller';

const router = Router();

router.get('/profile', authMiddleware, getCustomerProfile);
router.put('/profile', authMiddleware, updateCustomerProfile);

export default router;