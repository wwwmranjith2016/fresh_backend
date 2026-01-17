import prisma from '../config/database';
import { CreateOrderRequest, UpdateOrderStatusRequest, GuestOrderRequest } from '../types';
import { generateOrderNumber } from '../utils/orderNumber.util';
import notificationService from './notification.service';
import { OrderStatus, Prisma } from '@prisma/client';

export class OrderService {
  async createGuestOrder(data: GuestOrderRequest) {
    let user = await prisma.user.findUnique({
      where: { phone: data.phone },
    });

    if (!user) {
      if (!data.name || !data.address) {
        throw new Error('Name and address are required for new users');
      }

      user = await prisma.user.create({
        data: {
          phone: data.phone,
          name: data.name,
          password: '',
          role: 'CUSTOMER',
          fcmToken: data.fcmToken,
        },
      });
    } else if (data.fcmToken) {
      await prisma.user.update({
        where: { id: user.id },
        data: { fcmToken: data.fcmToken },
      });
    }

    let addressId = data.addressId;

    if (!addressId) {
      if (!data.address) {
        throw new Error('Address is required');
      }

      const newAddress = await prisma.address.create({
        data: {
          userId: user.id,
          label: 'Home',
          street: data.address.street,
          city: data.address.city,
          state: data.address.state,
          zipCode: data.address.zipCode,
          isDefault: true,
        },
      });
      addressId = newAddress.id;
    } else {
      await prisma.address.update({
        where: { id: addressId },
        data: { isDefault: true },
      });
    }

    const order = await this.createOrder(user.id, {
      addressId,
      items: data.items,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
    });

    return { order, user };
  }
  async createOrder(userId: string, data: CreateOrderRequest) {
    if (data.fcmToken) {
      await prisma.user.update({
        where: { id: userId },
        data: { fcmToken: data.fcmToken },
      });
    }

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

    // Send notifications in background to ensure they don't block and both are attempted
    Promise.allSettled([
      notificationService.sendOrderStatusNotification(order.id, OrderStatus.PLACED),
      notificationService.sendNewOrderNotificationToAdmins(order.id)
    ]).then(results => {
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`[OrderService] ${index === 0 ? 'Customer' : 'Admin'} notification failed:`, result.reason);
        }
      });
    });

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
    console.log(`Starting order status update for order ${orderId} to status ${status}`);
    
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
    
    console.log(`Order status updated successfully. Customer ID: ${order.customerId}`);
    
    console.log(`Sending order status notification to customer ${order.customerId}`);
    await notificationService.sendOrderStatusNotification(orderId, status);
    console.log(`Order status notification sent to customer ${order.customerId}`);

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
