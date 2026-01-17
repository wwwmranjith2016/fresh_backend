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
                android: {
                    priority: 'high',
                    notification: {
                        sound: 'default',
                        channelId: data?.type === 'new_order' ? 'new_orders' : 'order_updates',
                        priority: 'high',
                        defaultVibrateTimings: true,
                        visibility: 'public',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'default',
                            badge: 1,
                        },
                    },
                },
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
    async createNotification(userId, title, body, type = 'ORDER_STATUS', orderId, notificationType) {
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
            console.log(`[NotificationService] Attempting to send push notification to user ${userId} with token ${user.fcmToken.substring(0, 10)}...`);
            try {
                const response = await this.sendPushNotification(user.fcmToken, title, body, {
                    orderId,
                    type: notificationType || 'order_status'
                });
                if (response) {
                    console.log(`[NotificationService] Push notification successfully sent to user ${userId}`);
                }
                else {
                    console.log(`[NotificationService] Push notification skipped for user ${userId} (check Firebase config logs)`);
                }
            }
            catch (error) {
                console.error(`[NotificationService] Failed to send push notification to user ${userId}:`, error.message);
                // Clear FCM token if it's invalid or unregistered
                if (error.code === 'messaging/registration-token-not-registered' ||
                    error.code === 'messaging/invalid-registration-token') {
                    console.log(`[NotificationService] Clearing invalid FCM token for user ${userId}`);
                    await database_1.default.user.update({
                        where: { id: userId },
                        data: { fcmToken: null },
                    });
                }
            }
        }
        else {
            console.log(`[NotificationService] No FCM token found for user ${userId}, skipping push notification`);
        }
        return notification;
    }
    async sendOrderStatusNotification(orderId, status) {
        console.log(`[NotificationService] Finding order ${orderId} for status notification`);
        const order = await database_1.default.order.findUnique({
            where: { id: orderId },
            include: {
                customer: { select: { id: true, name: true, fcmToken: true } },
            },
        });
        if (!order) {
            console.error(`[NotificationService] Order ${orderId} not found`);
            throw new Error('Order not found');
        }
        console.log(`[NotificationService] Order found: #${order.orderNumber}, Customer: ${order.customerId}, FCM Token: ${order.customer.fcmToken ? 'present' : 'missing'}`);
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
        console.log(`[NotificationService] Creating notification for customer ${order.customerId}: ${title} - ${body}`);
        await this.createNotification(order.customerId, title, body, 'ORDER_STATUS', orderId);
        console.log(`[NotificationService] Notification created successfully`);
    }
    async sendNewOrderNotificationToAdmins(orderId) {
        try {
            const order = await database_1.default.order.findUnique({
                where: { id: orderId },
                include: {
                    customer: { select: { name: true } },
                },
            });
            if (!order) {
                console.error(`[NotificationService] Order ${orderId} not found for admin notification`);
                return;
            }
            const admins = await database_1.default.user.findMany({
                where: { role: 'ADMIN' },
                select: { id: true, fcmToken: true },
            });
            console.log(`[NotificationService] Found ${admins.length} admins to notify for order #${order.orderNumber}`);
            const title = '🔔 New Order Received!';
            const body = `Order #${order.orderNumber} from ${order.customer.name}`;
            for (const admin of admins) {
                try {
                    await this.createNotification(admin.id, title, body, 'ORDER_STATUS', orderId, 'new_order');
                    console.log(`[NotificationService] Notification sent to admin ${admin.id}`);
                }
                catch (error) {
                    console.error(`[NotificationService] Failed to notify admin ${admin.id}:`, error.message);
                }
            }
        }
        catch (error) {
            console.error(`[NotificationService] Error in sendNewOrderNotificationToAdmins:`, error.message);
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
