import { Router } from 'express';
import productController from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', productController.getAllProducts.bind(productController));
router.get('/:id', productController.getProductById.bind(productController));
router.post('/', authMiddleware, productController.createProduct.bind(productController));
router.put('/:id', authMiddleware, productController.updateProduct.bind(productController));
router.delete('/:id', authMiddleware, productController.deleteProduct.bind(productController));

export default router;
