import { Request, Response } from 'express';
import offerService from '../services/offer.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest, CreateOfferRequest } from '../types';

export class OfferController {
  async createOffer(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const data: CreateOfferRequest = req.body;

      // Validate required fields
      if (!data.title) {
        return sendError(res, 'Offer title is required', 400);
      }

      const offer = await offerService.createOffer(data);
      return sendSuccess(res, offer, 'Offer created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create offer', 400);
    }
  }

  async getAllOffers(req: Request, res: Response) {
    try {
      const { activeOnly } = req.query;
      const offers = await offerService.getAllOffers(
        activeOnly === 'true' ? true : activeOnly === 'false' ? false : undefined
      );
      return sendSuccess(res, offers);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch offers', 400);
    }
  }

  async getOfferById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const offer = await offerService.getOfferById(id);
      return sendSuccess(res, offer);
    } catch (error: any) {
      return sendError(res, error.message || 'Offer not found', 404);
    }
  }

  async updateOffer(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const data = req.body;

      const offer = await offerService.updateOffer(id, data);
      return sendSuccess(res, offer, 'Offer updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update offer', 400);
    }
  }

  async deleteOffer(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const { force } = req.query;

      const result = await offerService.deleteOffer(id, force === 'true');
      return sendSuccess(res, result, 'Offer deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete offer', 400);
    }
  }
}

export default new OfferController();
