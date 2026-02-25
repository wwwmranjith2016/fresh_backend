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

      // Convert string values to correct types
      data.price = parseFloat(data.price as unknown as string);
      if (data.discountPercentage !== undefined) {
        data.discountPercentage = parseFloat(data.discountPercentage as unknown as string);
      }
      if (data.discountPrice !== undefined) {
        data.discountPrice = parseFloat(data.discountPrice as unknown as string);
      }
      if (data.stockQuantity !== undefined) {
        data.stockQuantity = parseInt(data.stockQuantity as unknown as string, 10);
      }
      if (data.minOrderQuantity !== undefined) {
        data.minOrderQuantity = parseInt(data.minOrderQuantity as unknown as string, 10);
      }
      if (data.maxOrderQuantity !== undefined) {
        data.maxOrderQuantity = parseInt(data.maxOrderQuantity as unknown as string, 10);
      }
      if (data.displayOrder !== undefined) {
        data.displayOrder = parseInt(data.displayOrder as unknown as string, 10);
      }
      if (data.isFeatured !== undefined) {
        // Handle both boolean and string values
        if (typeof data.isFeatured === 'string') {
          data.isFeatured = data.isFeatured === 'true';
        }
        // If it's already a boolean, keep it as is
      }
      if (data.available !== undefined) {
        // Handle both boolean and string values
        if (typeof data.available === 'string') {
          data.available = data.available === 'true';
        }
        // If it's already a boolean, keep it as is
      }

      // Validate required fields
      if (!data.name || !data.description || !data.price || !data.categoryId || !data.unitId) {
        return sendError(res, 'Required fields: name, description, price, categoryId, unitId', 400);
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

      // Validate display order if provided
      if (data.displayOrder !== undefined && data.displayOrder < 0) {
        return sendError(res, 'Display order must be greater than or equal to 0', 400);
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
        categoryId,
        unitId,
        tags,
        minPrice,
        maxPrice,
        hasDiscount,
      } = req.query;

      // DEBUG: Log the received query params
      console.log('=== Product Filter Debug ===');
      console.log('categoryId:', categoryId);
      console.log('isFeatured:', isFeatured);
      console.log('available:', available);
      console.log('unitId:', unitId);
      console.log('=== End Debug ===');

      const filters: any = {};

      if (available !== undefined) {
        filters.available = available === 'true' ? true : available === 'false' ? false : undefined;
      }

      if (isFeatured !== undefined) {
        filters.isFeatured = isFeatured === 'true';
      }

      if (categoryId) {
        filters.categoryId = categoryId as string;
      }

      if (unitId) {
        filters.unitId = unitId as string;
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
      
      // Prevent caching
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
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

      // Convert string values to correct types if provided
      if (data.price !== undefined) {
        data.price = parseFloat(data.price as unknown as string);
      }
      if (data.discountPercentage !== undefined) {
        data.discountPercentage = parseFloat(data.discountPercentage as unknown as string);
      }
      if (data.discountPrice !== undefined) {
        data.discountPrice = parseFloat(data.discountPrice as unknown as string);
      }
      if (data.stockQuantity !== undefined) {
        data.stockQuantity = parseInt(data.stockQuantity as unknown as string, 10);
      }
      if (data.minOrderQuantity !== undefined) {
        data.minOrderQuantity = parseInt(data.minOrderQuantity as unknown as string, 10);
      }
      if (data.maxOrderQuantity !== undefined) {
        data.maxOrderQuantity = parseInt(data.maxOrderQuantity as unknown as string, 10);
      }
      if (data.displayOrder !== undefined) {
        data.displayOrder = parseInt(data.displayOrder as unknown as string, 10);
      }
      if (data.isFeatured !== undefined) {
        // Handle both boolean and string values
        if (typeof data.isFeatured === 'string') {
          data.isFeatured = data.isFeatured === 'true';
        }
        // If it's already a boolean, keep it as is
      }
      if (data.available !== undefined) {
        // Handle both boolean and string values
        if (typeof data.available === 'string') {
          data.available = data.available === 'true';
        }
        // If it's already a boolean, keep it as is
      }

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

  async reorderProducts(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { products } = req.body;
      
      if (!Array.isArray(products) || products.length === 0) {
        return sendError(res, 'Products array is required', 400);
      }

      const result = await productService.reorderProducts(products);
      return sendSuccess(res, result, 'Products reordered successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to reorder products', 400);
    }
  }
}

export default new ProductController();
