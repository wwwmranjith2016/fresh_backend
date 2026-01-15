import { Response, Request } from 'express';
import orderService from '../services/order.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest, CreateOrderRequest, GuestOrderRequest } from '../types';
import { OrderStatus } from '@prisma/client';

export class OrderController {
  async createGuestOrder(req: Request, res: Response) {
    try {
      const data: GuestOrderRequest = req.body;

      if (!data.phone || !data.name || !data.address || !data.items || data.items.length === 0) {
        return sendError(res, 'Phone, name, address and items are required', 400);
      }

      if (!data.address.street || !data.address.city || !data.address.state || !data.address.zipCode) {
        return sendError(res, 'Complete address is required', 400);
      }

      const order = await orderService.createGuestOrder(data);
      return sendSuccess(res, order, 'Order placed successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create order', 400);
    }
  }
  async createOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const data: CreateOrderRequest = req.body;

      if (!data.addressId || !data.items || data.items.length === 0) {
        return sendError(res, 'Address and items are required', 400);
      }

      const order = await orderService.createOrder(userId, data);
      return sendSuccess(res, order, 'Order placed successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create order', 400);
    }
  }

  async getUserOrders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const orders = await orderService.getUserOrders(userId);
      return sendSuccess(res, orders);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch orders', 400);
    }
  }

  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      const order = await orderService.getOrderById(id, userId);
      return sendSuccess(res, order);
    } catch (error: any) {
      return sendError(res, error.message || 'Order not found', 404);
    }
  }

  async cancelOrder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const { id } = req.params;
      const order = await orderService.cancelOrder(id, userId);
      return sendSuccess(res, order, 'Order cancelled successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to cancel order', 400);
    }
  }

  async getAllOrders(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { status } = req.query;
      const statusFilter = status ? (status as OrderStatus) : undefined;

      const orders = await orderService.getAllOrders(statusFilter);
      return sendSuccess(res, orders);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch orders', 400);
    }
  }

  async getOrderByIdAdmin(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const order = await orderService.getAllOrders();
      const foundOrder = order.find((o) => o.id === id);

      if (!foundOrder) {
        return sendError(res, 'Order not found', 404);
      }

      return sendSuccess(res, foundOrder);
    } catch (error: any) {
      return sendError(res, error.message || 'Order not found', 404);
    }
  }

  async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return sendError(res, 'Status is required', 400);
      }

      const order = await orderService.updateOrderStatus(id, status as OrderStatus);
      return sendSuccess(res, order, 'Order status updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update order status', 400);
    }
  }

  async getDashboardStats(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const stats = await orderService.getDashboardStats();
      return sendSuccess(res, stats);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch dashboard stats', 400);
    }
  }
}

export default new OrderController();
