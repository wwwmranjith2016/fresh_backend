import prisma from '../config/database';
import { CreateOrderRequest, UpdateOrderStatusRequest } from '../types';
import { generateOrderNumber } from '../utils/orderNumber.util';
import notificationService from './notification.service';
import { OrderStatus, Prisma } from '@prisma/client';

export class OrderService {
  async createOrder(userId: string, data: CreateOrderRequest) {
    let subtotal = 0;

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (!product.available) {
        throw new Error(`Product ${product.name} is not available`);
      }

      subtotal += Number(product.price) * item.quantity;
    }

    const deliveryFee = 50;
    const tax = subtotal * 0.05;
    const total = subtotal + deliveryFee + tax;

    const orderNumber = generateOrderNumber();

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: userId,
        addressId: data.addressId,
        subtotal: new Prisma.Decimal(subtotal),
        deliveryFee: new Prisma.Decimal(deliveryFee),
        tax: new Prisma.Decimal(tax),
        total: new Prisma.Decimal(total),
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000),
        items: {
          create: await Promise.all(
            data.items.map(async (item) => {
              const product = await prisma.product.findUnique({
                where: { id: item.productId },
              });
              const unitPrice = Number(product!.price);
              const itemSubtotal = unitPrice * item.quantity;

              return {
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: new Prisma.Decimal(unitPrice),
                subtotal: new Prisma.Decimal(itemSubtotal),
              };
            })
          ),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    await notificationService.sendOrderStatusNotification(order.id, OrderStatus.PLACED);
    await notificationService.sendNewOrderNotificationToAdmins(order.id);

    return order;
  }

  async getUserOrders(userId: string) {
    const orders = await prisma.order.findMany({
      where: { customerId: userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async getAllOrders(status?: OrderStatus) {
    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        deliveredAt: status === OrderStatus.DELIVERED ? new Date() : undefined,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    await notificationService.sendOrderStatusNotification(orderId, status);

    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
      throw new Error('Cannot cancel this order');
    }

    const updatedOrder = await this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
    return updatedOrder;
  }

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayOrders, totalOrders, pendingOrders, todayRevenue] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: { gte: today },
          status: { not: OrderStatus.CANCELLED },
        },
      }),
      prisma.order.count({
        where: {
          status: { not: OrderStatus.CANCELLED },
        },
      }),
      prisma.order.count({
        where: {
          status: { in: [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PROCESSING] },
        },
      }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { not: OrderStatus.CANCELLED },
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    return {
      todayOrders,
      totalOrders,
      pendingOrders,
      todayRevenue: Number(todayRevenue._sum.total || 0),
    };
  }
}

export default new OrderService();
