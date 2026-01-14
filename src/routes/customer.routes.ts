import { Router } from 'express';
import authController from '../controllers/auth.controller';

const router = Router();

router.get('/last', authController.getLatestCustomer.bind(authController));

export default router;
