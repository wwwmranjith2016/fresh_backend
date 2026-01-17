"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const order_service_1 = __importDefault(require("../services/order.service"));
const response_util_1 = require("../utils/response.util");
const jwt_util_1 = require("../utils/jwt.util");
class OrderController {
    async createGuestOrder(req, res) {
        try {
            const data = req.body;
            if (!data.phone || !data.items || data.items.length === 0) {
                return (0, response_util_1.sendError)(res, 'Phone and items are required', 400);
            }
            if (!data.addressId && !data.address) {
                return (0, response_util_1.sendError)(res, 'Either addressId or address is required', 400);
            }
            if (!data.addressId && data.address) {
                if (!data.address.street || !data.address.city || !data.address.state || !data.address.zipCode) {
                    return (0, response_util_1.sendError)(res, 'Complete address is required', 400);
                }
            }
            const { order, user } = await order_service_1.default.createGuestOrder(data);
            const payload = {
                id: user.id,
                phone: user.phone,
                role: user.role,
            };
            const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
            const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
            return (0, response_util_1.sendSuccess)(res, {
                order,
                accessToken,
                refreshToken,
                user: {
                    id: user.id,
                    phone: user.phone,
                    name: user.name,
                    role: user.role,
                }
            }, 'Order placed successfully', 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to create order', 400);
        }
    }
    async createOrder(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const data = req.body;
            if (!data.addressId || !data.items || data.items.length === 0) {
                return (0, response_util_1.sendError)(res, 'Address and items are required', 400);
            }
            const order = await order_service_1.default.createOrder(userId, data);
            return (0, response_util_1.sendSuccess)(res, order, 'Order placed successfully', 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to create order', 400);
        }
    }
    async getUserOrders(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const orders = await order_service_1.default.getUserOrders(userId);
            return (0, response_util_1.sendSuccess)(res, orders);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to fetch orders', 400);
        }
    }
    async getOrderById(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const { id } = req.params;
            const order = await order_service_1.default.getOrderById(id, userId);
            return (0, response_util_1.sendSuccess)(res, order);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Order not found', 404);
        }
    }
    async cancelOrder(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const { id } = req.params;
            const order = await order_service_1.default.cancelOrder(id, userId);
            return (0, response_util_1.sendSuccess)(res, order, 'Order cancelled successfully');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to cancel order', 400);
        }
    }
    async getAllOrders(req, res) {
        try {
            if (req.user?.role !== 'ADMIN') {
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const { status } = req.query;
            const statusFilter = status ? status : undefined;
            const orders = await order_service_1.default.getAllOrders(statusFilter);
            return (0, response_util_1.sendSuccess)(res, orders);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to fetch orders', 400);
        }
    }
    async getOrderByIdAdmin(req, res) {
        try {
            if (req.user?.role !== 'ADMIN') {
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const { id } = req.params;
            const order = await order_service_1.default.getAllOrders();
            const foundOrder = order.find((o) => o.id === id);
            if (!foundOrder) {
                return (0, response_util_1.sendError)(res, 'Order not found', 404);
            }
            return (0, response_util_1.sendSuccess)(res, foundOrder);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Order not found', 404);
        }
    }
    async updateOrderStatus(req, res) {
        try {
            console.log(`[OrderController] Update order status request received for order ${req.params.id}`);
            if (req.user?.role !== 'ADMIN') {
                console.log(`[OrderController] Unauthorized access attempt by user ${req.user?.id}`);
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const { id } = req.params;
            const { status } = req.body;
            console.log(`[OrderController] Updating order ${id} to status ${status}`);
            if (!status) {
                return (0, response_util_1.sendError)(res, 'Status is required', 400);
            }
            const order = await order_service_1.default.updateOrderStatus(id, status);
            console.log(`[OrderController] Order status updated successfully for order ${id}`);
            return (0, response_util_1.sendSuccess)(res, order, 'Order status updated successfully');
        }
        catch (error) {
            console.error(`[OrderController] Error updating order status: ${error.message}`);
            return (0, response_util_1.sendError)(res, error.message || 'Failed to update order status', 400);
        }
    }
    async getDashboardStats(req, res) {
        try {
            if (req.user?.role !== 'ADMIN') {
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const stats = await order_service_1.default.getDashboardStats();
            return (0, response_util_1.sendSuccess)(res, stats);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to fetch dashboard stats', 400);
        }
    }
}
exports.OrderController = OrderController;
exports.default = new OrderController();
