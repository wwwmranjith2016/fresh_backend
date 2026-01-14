"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = __importDefault(require("../services/notification.service"));
const response_util_1 = require("../utils/response.util");
class NotificationController {
    async getUserNotifications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const notifications = await notification_service_1.default.getUserNotifications(userId);
            return (0, response_util_1.sendSuccess)(res, notifications);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to fetch notifications', 400);
        }
    }
    async markAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            const { id } = req.params;
            await notification_service_1.default.markAsRead(id, userId);
            return (0, response_util_1.sendSuccess)(res, null, 'Notification marked as read');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to mark notification as read', 400);
        }
    }
    async markAllAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_util_1.sendError)(res, 'Unauthorized', 401);
            }
            await notification_service_1.default.markAllAsRead(userId);
            return (0, response_util_1.sendSuccess)(res, null, 'All notifications marked as read');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to mark all notifications as read', 400);
        }
    }
}
exports.NotificationController = NotificationController;
exports.default = new NotificationController();
