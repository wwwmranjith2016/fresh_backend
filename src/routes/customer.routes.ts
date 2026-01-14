import { Router } from 'express';
import customerController from '../controllers/customer.controller';

const router = Router();

router.get('/last', customerController.getLastCustomer.bind(customerController));

export default router;