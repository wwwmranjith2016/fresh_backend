import { Router } from 'express';
import unitController from '../controllers/unit.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', unitController.getAllUnits.bind(unitController));
router.get('/:id', unitController.getUnitById.bind(unitController));
router.post('/', authMiddleware, unitController.createUnit.bind(unitController));
router.put('/:id', authMiddleware, unitController.updateUnit.bind(unitController));
router.delete('/:id', authMiddleware, unitController.deleteUnit.bind(unitController));

export default router;
