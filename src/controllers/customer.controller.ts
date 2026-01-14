import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response.util';
import { getCustomerById, updateCustomer } from '../services/customer.service';

export const getCustomerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    
    if (!customerId) {
      return sendError(res, 'Customer ID not found in token', 400);
    }
    
    const customer = await getCustomerById(customerId);
    
    if (!customer) {
      return sendError(res, 'Customer not found', 404);
    }
    
    return sendSuccess(res, customer, 'Customer profile retrieved successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to retrieve customer profile', 400);
  }
};

export const updateCustomerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user?.id;
    const updateData = req.body;
    
    if (!customerId) {
      return sendError(res, 'Customer ID not found in token', 400);
    }
    
    const updatedCustomer = await updateCustomer(customerId, updateData);
    
    return sendSuccess(res, updatedCustomer, 'Customer profile updated successfully');
  } catch (error: any) {
    return sendError(res, error.message || 'Failed to update customer profile', 400);
  }
};