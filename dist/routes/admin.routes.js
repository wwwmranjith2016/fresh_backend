"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.use(auth_middleware_1.adminMiddleware);
router.get('/orders', order_controller_1.default.getAllOrders.bind(order_controller_1.default));
router.get('/orders/:id', order_controller_1.default.getOrderByIdAdmin.bind(order_controller_1.default));
router.put('/orders/:id/status', order_controller_1.default.updateOrderStatus.bind(order_controller_1.default));
router.get('/dashboard/stats', order_controller_1.default.getDashboardStats.bind(order_controller_1.default));
exports.default = router;
