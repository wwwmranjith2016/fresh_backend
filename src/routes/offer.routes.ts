import { Router } from 'express';
import offerController from '../controllers/offer.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', offerController.getAllOffers.bind(offerController));
router.get('/:id', offerController.getOfferById.bind(offerController));
router.post('/', authMiddleware, offerController.createOffer.bind(offerController));
router.put('/:id', authMiddleware, offerController.updateOffer.bind(offerController));
router.delete('/:id', authMiddleware, offerController.deleteOffer.bind(offerController));

export default router;
