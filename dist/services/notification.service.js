"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const database_1 = __importDefault(require("../config/database"));
const firebase_1 = require("../config/firebase");
class NotificationService {
    async sendPushNotification(fcmToken, title, body, data) {
        try {
            if (!firebase_1.messaging) {
                console.log('Firebase not configured, skipping push notification');
                return null;
            }
            if (!fcmToken) {
                console.log('No FCM token provided, skipping push notification');
                return null;
            }
            const message = {
                token: fcmToken,
                notification: {
                    title,
                    body,
                },
                data: data || {},
            };
            const response = await firebase_1.messaging.send(message);
            console.log('Successfully sent push notification:', response);
            return response;
        }
        catch (error) {
            console.error('Error sending push notification:', error);
            throw error;
        }
    }
    async createNotification(userId, title, body, type = 'ORDER_STATUS', orderId) {
        const notification = await database_1.default.notification.create({
            data: {
                userId,
                title,
                body,
                type,
                orderId,
            },
        });
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            select: { fcmToken: true },
        });
        if (user?.fcmToken) {
            try {
                await this.sendPushNotification(user.fcmToken, title, body, { orderId });
            }
            catch (error) {
                console.error('Failed to send push notification:', error);
            }
        }
        return notification;
    }
    async sendOrderStatusNotification(orderId, status) {
        const order = await database_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                customer: { select: { id: true, name: true, fcmToken: true } },
            },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        const statusMessages = {
            PLACED: `Your order #${order.orderNumber} has been placed successfully`,
            CONFIRMED: `Your order #${order.orderNumber} has been confirmed and is being processed`,
            PROCESSING: `We're preparing your order #${order.orderNumber}`,
            PREPARED: `Your order #${order.orderNumber} is ready and will be delivered soon`,
            OUT_FOR_DELIVERY: `Your order #${order.orderNumber} is on the way!`,
            DELIVERED: `Your order #${order.orderNumber} has been delivered. Enjoy!`,
            CANCELLED: `Your order #${order.orderNumber} has been cancelled`,
        };
        const title = status === 'PLACED' ? 'Order Placed' : 'Order Update';
        const body = statusMessages[status];
        await this.createNotification(order.customerId, title, body, 'ORDER_STATUS', orderId);
    }
    async sendNewOrderNotificationToAdmins(orderId) {
        const order = await database_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                customer: { select: { name: true } },
            },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        const admins = await database_1.default.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, fcmToken: true },
        });
        const title = '🔔 New Order Received!';
        const body = `Order #${order.orderNumber} from ${order.customer.name}`;
        for (const admin of admins) {
            await this.createNotification(admin.id, title, body, 'ORDER_STATUS', orderId);
        }
    }
    async getUserNotifications(userId) {
        const notifications = await database_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return notifications;
    }
    async markAsRead(notificationId, userId) {
        await database_1.default.notification.updateMany({
            where: { id: notificationId, userId },
            data: { read: true },
        });
        return { success: true };
    }
    async markAllAsRead(userId) {
        await database_1.default.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        return { success: true };
    }
}
exports.NotificationService = NotificationService;
exports.default = new NotificationService();
