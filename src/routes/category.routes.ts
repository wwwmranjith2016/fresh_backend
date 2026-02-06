import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));
router.post('/', authMiddleware, categoryController.createCategory.bind(categoryController));
router.put('/:id', authMiddleware, categoryController.updateCategory.bind(categoryController));
router.delete('/:id', authMiddleware, categoryController.deleteCategory.bind(categoryController));

export default router;
