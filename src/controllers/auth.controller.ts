import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { RegisterRequest, LoginRequest, AuthRequest } from '../types';
import { verifyRefreshToken, generateAccessToken } from '../utils/jwt.util';

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const data: RegisterRequest = req.body;

      if (!data.phone || !data.password || !data.name) {
        return sendError(res, 'Phone, password, and name are required', 400);
      }

      if (data.password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters', 400);
      }

      const result = await authService.register(data);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed', 400);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const data: LoginRequest = req.body;

      if (!data.phone || !data.password) {
        return sendError(res, 'Phone and password are required', 400);
      }

      const result = await authService.login(data);
      return sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed', 401);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return sendError(res, 'Refresh token is required', 400);
      }

      const payload = verifyRefreshToken(refreshToken);
      const newAccessToken = generateAccessToken(payload);

      return sendSuccess(res, { accessToken: newAccessToken }, 'Token refreshed');
    } catch (error: any) {
      return sendError(res, 'Invalid refresh token', 401);
    }
  }

  async updateFcmToken(req: AuthRequest, res: Response) {
    try {
      const { fcmToken } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      if (!fcmToken) {
        return sendError(res, 'FCM token is required', 400);
      }

      await authService.updateFcmToken(userId, fcmToken);
      return sendSuccess(res, null, 'FCM token updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update FCM token', 400);
    }
  }

  async logout(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (userId) {
        await authService.updateFcmToken(userId, '');
      }

      return sendSuccess(res, null, 'Logout successful');
    } catch (error: any) {
      return sendError(res, error.message || 'Logout failed', 400);
    }
  }
}

export default new AuthController();
