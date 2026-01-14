import prisma from '../config/database';
import { messaging } from '../config/firebase';
import { NotificationType, OrderStatus } from '@prisma/client';

export class NotificationService {
  async sendPushNotification(fcmToken: string, title: string, body: string, data?: any) {
    try {
      if (!messaging) {
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

      const response = await messaging.send(message);
      console.log('Successfully sent push notification:', response);
      return response;
    } catch (error: any) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  async createNotification(
    userId: string,
    title: string,
    body: string,
    type: NotificationType = 'ORDER_STATUS',
    orderId?: string
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        orderId,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fcmToken: true },
    });

    if (user?.fcmToken) {
      try {
        await this.sendPushNotification(user.fcmToken, title, body, { orderId });
      } catch (error) {
        console.error('Failed to send push notification:', error);
      }
    }

    return notification;
  }

  async sendOrderStatusNotification(orderId: string, status: OrderStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { id: true, name: true, fcmToken: true } },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const statusMessages: Record<OrderStatus, string> = {
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

  async sendNewOrderNotificationToAdmins(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: { select: { name: true } },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, fcmToken: true },
    });

    const title = '🔔 New Order Received!';
    const body = `Order #${order.orderNumber} from ${order.customer.name}`;

    for (const admin of admins) {
      await this.createNotification(admin.id, title, body, 'ORDER_STATUS', orderId);
    }
  }

  async getUserNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return notifications;
  }

  async markAsRead(notificationId: string, userId: string) {
    await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { read: true },
    });

    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    return { success: true };
  }
}

export default new NotificationService();
