import { Response } from 'express';
import addressService from '../services/address.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest, CreateAddressRequest } from '../types';

export class AddressController {
  async createAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const data: CreateAddressRequest = req.body;

      if (!data.label || !data.street || !data.city || !data.state || !data.zipCode) {
        return sendError(res, 'All address fields are required', 400);
      }

      const address = await addressService.createAddress(userId, data);
      return sendSuccess(res, address, 'Address created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create address', 400);
    }
  }

  async getUserAddresses(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const addresses = await addressService.getUserAddresses(userId);
      return sendSuccess(res, addresses);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch addresses', 400);
    }
  }

  async updateAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      const data = req.body;

      const address = await addressService.updateAddress(id, userId, data);
      return sendSuccess(res, address, 'Address updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update address', 400);
    }
  }

  async deleteAddress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      await addressService.deleteAddress(id, userId);
      return sendSuccess(res, null, 'Address deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete address', 400);
    }
  }
}

export default new AddressController();
