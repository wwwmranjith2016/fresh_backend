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

      // Validate required fields
      if (!data.name || !data.description || !data.price || !data.category || !data.unit) {
        return sendError(res, 'Required fields: name, description, price, category, unit', 400);
      }

      // Validate price is positive
      if (data.price <= 0) {
        return sendError(res, 'Price must be greater than 0', 400);
      }

      // Validate discount percentage if provided
      if (data.discountPercentage !== undefined && (data.discountPercentage < 0 || data.discountPercentage > 100)) {
        return sendError(res, 'Discount percentage must be between 0 and 100', 400);
      }

      // Validate discount price if provided
      if (data.discountPrice !== undefined && data.discountPrice < 0) {
        return sendError(res, 'Discount price must be greater than or equal to 0', 400);
      }

      // Validate stock quantity if provided
      if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
        return sendError(res, 'Stock quantity must be greater than or equal to 0', 400);
      }

      // Validate min order quantity if provided
      if (data.minOrderQuantity !== undefined && data.minOrderQuantity < 1) {
        return sendError(res, 'Minimum order quantity must be at least 1', 400);
      }

      // Validate max order quantity if provided
      if (data.maxOrderQuantity !== undefined && data.maxOrderQuantity < 1) {
        return sendError(res, 'Maximum order quantity must be at least 1', 400);
      }

      // Validate offer dates if both provided
      if (data.offerValidFrom && data.offerValidUntil) {
        const validFrom = new Date(data.offerValidFrom);
        const validUntil = new Date(data.offerValidUntil);
        if (validFrom >= validUntil) {
          return sendError(res, 'Offer valid from date must be before valid until date', 400);
        }
      }

      const product = await productService.createProduct(data);
      return sendSuccess(res, product, 'Product created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create product', 400);
    }
  }

  async getAllProducts(req: Request, res: Response) {
    try {
      const {
        available,
        isFeatured,
        category,
        tags,
        minPrice,
        maxPrice,
        hasDiscount,
      } = req.query;

      const filters: any = {};

      if (available !== undefined) {
        filters.available = available === 'true' ? true : available === 'false' ? false : undefined;
      }

      if (isFeatured !== undefined) {
        filters.isFeatured = isFeatured === 'true';
      }

      if (category) {
        filters.category = category as string;
      }

      if (tags) {
        filters.tags = Array.isArray(tags) ? tags as string[] : [tags as string];
      }

      if (minPrice) {
        filters.minPrice = parseFloat(minPrice as string);
      }

      if (maxPrice) {
        filters.maxPrice = parseFloat(maxPrice as string);
      }

      if (hasDiscount !== undefined) {
        filters.hasDiscount = hasDiscount === 'true';
      }

      const products = await productService.getAllProducts(filters);
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
