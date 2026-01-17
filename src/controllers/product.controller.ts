import { Request, Response } from 'express';
import productService from '../services/product.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { CreateProductRequest, AuthRequest } from '../types';

export class ProductController {
  async createProduct(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const data: CreateProductRequest = req.body;

      if (!data.name || !data.description || !data.price || !data.category || !data.unit) {
        return sendError(res, 'All product fields are required', 400);
      }

      const product = await productService.createProduct(data);
      return sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create product', 400);
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const { available } = req.query;
      const availableFilter = available === 'true' ? true : available === 'false' ? false : undefined;

      const products = await productService.getAllProducts(availableFilter);
      return sendSuccess(res, products);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch products', 400);
    }
  }

  async getProductById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);
      return sendSuccess(res, product);
    } catch (error: any) {
      return sendError(res, error.message || 'Product not found', 404);
    }
  }

  async updateProduct(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const data = req.body;

      const product = await productService.updateProduct(id, data);
      return sendSuccess(res, product, 'Product updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update product', 400);
    }
  }

  async deleteProduct(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      await productService.deleteProduct(id);
      return sendSuccess(res, null, 'Product deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete product', 400);
    }
  }
}

export default new ProductController();
