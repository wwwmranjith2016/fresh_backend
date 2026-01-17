"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const database_1 = __importDefault(require("../config/database"));
const orderNumber_util_1 = require("../utils/orderNumber.util");
const notification_service_1 = __importDefault(require("./notification.service"));
const client_1 = require("@prisma/client");
class OrderService {
    async createGuestOrder(data) {
        let user = await database_1.default.user.findUnique({
            where: { phone: data.phone },
        });
        if (!user) {
            if (!data.name || !data.address) {
                throw new Error('Name and address are required for new users');
            }
            user = await database_1.default.user.create({
                data: {
                    phone: data.phone,
                    name: data.name,
                    password: '',
                    role: 'CUSTOMER',
                    fcmToken: data.fcmToken,
                },
            });
        }
        else if (data.fcmToken) {
            await database_1.default.user.update({
                where: { id: user.id },
                data: { fcmToken: data.fcmToken },
            });
        }
        let addressId = data.addressId;
        if (!addressId) {
            if (!data.address) {
                throw new Error('Address is required');
            }
            const newAddress = await database_1.default.address.create({
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
        }
        else {
            await database_1.default.address.update({
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
    async createOrder(userId, data) {
        if (data.fcmToken) {
            await database_1.default.user.update({
                where: { id: userId },
                data: { fcmToken: data.fcmToken },
            });
        }
        let subtotal = 0;
        for (const item of data.items) {
            const product = await database_1.default.product.findUnique({
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
        const orderNumber = (0, orderNumber_util_1.generateOrderNumber)();
        const order = await database_1.default.order.create({
            data: {
                orderNumber,
                customerId: userId,
                addressId: data.addressId,
                subtotal: new client_1.Prisma.Decimal(subtotal),
                deliveryFee: new client_1.Prisma.Decimal(deliveryFee),
                tax: new client_1.Prisma.Decimal(tax),
                total: new client_1.Prisma.Decimal(total),
                paymentMethod: data.paymentMethod,
                notes: data.notes,
                estimatedDeliveryTime: new Date(Date.now() + 60 * 60 * 1000),
                items: {
                    create: await Promise.all(data.items.map(async (item) => {
                        const product = await database_1.default.product.findUnique({
                            where: { id: item.productId },
                        });
                        const unitPrice = Number(product.price);
                        const itemSubtotal = unitPrice * item.quantity;
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            unitPrice: new client_1.Prisma.Decimal(unitPrice),
                            subtotal: new client_1.Prisma.Decimal(itemSubtotal),
                        };
                    })),
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
            notification_service_1.default.sendOrderStatusNotification(order.id, client_1.OrderStatus.PLACED),
            notification_service_1.default.sendNewOrderNotificationToAdmins(order.id)
        ]).then(results => {
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`[OrderService] ${index === 0 ? 'Customer' : 'Admin'} notification failed:`, result.reason);
                }
            });
        });
        return order;
    }
    async getUserOrders(userId) {
        const orders = await database_1.default.order.findMany({
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
    async getOrderById(orderId, userId) {
        const order = await database_1.default.order.findFirst({
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
    async getAllOrders(status) {
        const where = status ? { status } : {};
        const orders = await database_1.default.order.findMany({
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
    async updateOrderStatus(orderId, status) {
        console.log(`Starting order status update for order ${orderId} to status ${status}`);
        const order = await database_1.default.order.update({
            where: { id: orderId },
            data: {
                status,
                deliveredAt: status === client_1.OrderStatus.DELIVERED ? new Date() : undefined,
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
        await notification_service_1.default.sendOrderStatusNotification(orderId, status);
        console.log(`Order status notification sent to customer ${order.customerId}`);
        return order;
    }
    async cancelOrder(orderId, userId) {
        const order = await database_1.default.order.findFirst({
            where: { id: orderId, customerId: userId },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        if (['DELIVERED', 'CANCELLED'].includes(order.status)) {
            throw new Error('Cannot cancel this order');
        }
        const updatedOrder = await this.updateOrderStatus(orderId, client_1.OrderStatus.CANCELLED);
        return updatedOrder;
    }
    async getDashboardStats() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const [todayOrders, totalOrders, pendingOrders, todayRevenue] = await Promise.all([
            database_1.default.order.count({
                where: {
                    createdAt: { gte: today },
                    status: { not: client_1.OrderStatus.CANCELLED },
                },
            }),
            database_1.default.order.count({
                where: {
                    status: { not: client_1.OrderStatus.CANCELLED },
                },
            }),
            database_1.default.order.count({
                where: {
                    status: { in: [client_1.OrderStatus.PLACED, client_1.OrderStatus.CONFIRMED, client_1.OrderStatus.PROCESSING] },
                },
            }),
            database_1.default.order.aggregate({
                where: {
                    createdAt: { gte: today },
                    status: { not: client_1.OrderStatus.CANCELLED },
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
exports.OrderService = OrderService;
exports.default = new OrderService();
