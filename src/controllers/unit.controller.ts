import { Request, Response } from 'express';
import unitService from '../services/unit.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { AuthRequest, CreateUnitRequest } from '../types';

export class UnitController {
  async createUnit(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const data: CreateUnitRequest = req.body;

      // Validate required fields
      if (!data.name) {
        return sendError(res, 'Unit name is required', 400);
      }

      const unit = await unitService.createUnit(data);
      return sendSuccess(res, unit, 'Unit created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create unit', 400);
    }
  }

  async getAllUnits(req: Request, res: Response) {
    try {
      const { activeOnly } = req.query;
      const units = await unitService.getAllUnits(
        activeOnly === 'true' ? true : activeOnly === 'false' ? false : undefined
      );
      return sendSuccess(res, units);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch units', 400);
    }
  }

  async getUnitById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const unit = await unitService.getUnitById(id);
      return sendSuccess(res, unit);
    } catch (error: any) {
      return sendError(res, error.message || 'Unit not found', 404);
    }
  }

  async updateUnit(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const data = req.body;

      const unit = await unitService.updateUnit(id, data);
      return sendSuccess(res, unit, 'Unit updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update unit', 400);
    }
  }

  async deleteUnit(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'ADMIN') {
        return sendError(res, 'Unauthorized: Admin access required', 403);
      }

      const { id } = req.params;
      const { force } = req.query;

      const result = await unitService.deleteUnit(id, force === 'true');
      return sendSuccess(res, result, 'Unit deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete unit', 400);
    }
  }
}

export default new UnitController();
