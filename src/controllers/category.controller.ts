import { Request, Response } from 'express';
import categoryService from '../services/category.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest, CreateCategoryRequest } from '../types';

export class CategoryController {
  async createCategory(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const data: CreateCategoryRequest = req.body;

      // Validate required fields
      if (!data.name) {
        return sendError(res, 'Category name is required', 400);
      }

      const category = await categoryService.createCategory(data);
      return sendSuccess(res, category, 'Category created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create category', 400);
    }
  }

  async getAllCategories(req: Request, res: Response) {
    try {
      const { activeOnly } = req.query;
      const categories = await categoryService.getAllCategories(
        activeOnly === 'true' ? true : activeOnly === 'false' ? false : undefined
      );
      return sendSuccess(res, categories);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch categories', 400);
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);
      return sendSuccess(res, category);
    } catch (error: any) {
      return sendError(res, error.message || 'Category not found', 404);
    }
  }

  async updateCategory(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const data = req.body;

      const category = await categoryService.updateCategory(id, data);
      return sendSuccess(res, category, 'Category updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update category', 400);
    }
  }

  async deleteCategory(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const { force } = req.query;

      const result = await categoryService.deleteCategory(id, force === 'true');
      return sendSuccess(res, result, 'Category deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete category', 400);
    }
  }
}

export default new CategoryController();
