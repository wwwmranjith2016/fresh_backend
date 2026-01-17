import { Router } from 'express';
import addressController from '../controllers/address.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, addressController.getUserAddresses.bind(addressController));
router.post('/', authMiddleware, addressController.createAddress.bind(addressController));
router.put('/:id', authMiddleware, addressController.updateAddress.bind(addressController));
router.delete('/:id', authMiddleware, addressController.deleteAddress.bind(addressController));

export default router;
