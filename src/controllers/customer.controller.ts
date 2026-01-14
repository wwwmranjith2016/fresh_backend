import { Request, Response } from 'express';
import customerService from '../services/customer.service';
import { sendSuccess, sendError } from '../utils/response.util';

export class CustomerController {
  async getLastCustomer(req: Request, res: Response) {
    try {
      const lastCustomer = await customerService.getLastCustomer();
      return sendSuccess(res, lastCustomer);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch last customer', 400);
    }
  }
}

export default new CustomerController();