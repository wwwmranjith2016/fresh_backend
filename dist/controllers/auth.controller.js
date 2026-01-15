"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = __importDefault(require("../services/auth.service"));
const response_util_1 = require("../utils/response.util");
const jwt_util_1 = require("../utils/jwt.util");
class AuthController {
    async register(req, res) {
        try {
            const data = req.body;
            if (!data.phone || !data.password || !data.name) {
                return (0, response_util_1.sendError)(res, 'Phone, password, and name are required', 400);
            }
            if (data.password.length < 6) {
                return (0, response_util_1.sendError)(res, 'Password must be at least 6 characters', 400);
            }
            const result = await auth_service_1.default.register(data);
            return (0, response_util_1.sendSuccess)(res, result, 'Registration successful', 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Registration failed', 400);
        }
    }
    async login(req, res) {
        try {
            const data = req.body;
            if (!data.phone || !data.password) {
                return (0, response_util_1.sendError)(res, 'Phone and password are required', 400);
            }
            const result = await auth_service_1.default.login(data);
            return (0, response_util_1.sendSuccess)(res, result, 'Login successful');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Login failed', 401);
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) {
                return (0, response_util_1.sendError)(res, 'Refresh token is required', 400);
            }
            const payload = (0, jwt_util_1.verifyRefreshToken)(refreshToken);
            const newAccessToken = (0, jwt_util_1.generateAccessToken)(payload);
            return (0, response_util_1.sendSuccess)(res, { accessToken: newAccessToken }, 'Token refreshed');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, 'Invalid refresh token', 401);
        }
    }
    async updateFcmToken(req, res) {
        try {
            const { fcmToken } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            if (!fcmToken) {
                return (0, response_util_1.sendError)(res, 'FCM token is required', 400);
            }
            await auth_service_1.default.updateFcmToken(userId, fcmToken);
            return (0, response_util_1.sendSuccess)(res, null, 'FCM token updated successfully');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to update FCM token', 400);
        }
    }
    async logout(req, res) {
        try {
            const userId = req.user?.id;
            if (userId) {
                await auth_service_1.default.updateFcmToken(userId, '');
            }
            return (0, response_util_1.sendSuccess)(res, null, 'Logout successful');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Logout failed', 400);
        }
    }
    async getLatestCustomer(req, res) {
        try {
            const customer = await auth_service_1.default.getLatestCustomer();
            if (!customer) {
                return (0, response_util_1.sendError)(res, 'No customers found', 404);
            }
            return (0, response_util_1.sendSuccess)(res, customer, 'Latest customer retrieved');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to get latest customer', 400);
        }
    }
    async getUserByPhone(req, res) {
        try {
            const { phone } = req.params;
            if (!phone) {
                return (0, response_util_1.sendError)(res, 'Phone number is required', 400);
            }
            const result = await auth_service_1.default.getUserByPhone(phone);
            if (!result) {
                return (0, response_util_1.sendSuccess)(res, { exists: false, user: null, addresses: [] });
            }
            return (0, response_util_1.sendSuccess)(res, {
                exists: true,
                user: result.user,
                addresses: result.addresses
            });
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to get user by phone', 400);
        }
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
