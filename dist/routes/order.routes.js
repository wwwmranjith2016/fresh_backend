"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = __importDefault(require("../controllers/order.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.post('/guest', order_controller_1.default.createGuestOrder.bind(order_controller_1.default));
router.post('/', auth_middleware_1.authMiddleware, order_controller_1.default.createOrder.bind(order_controller_1.default));
router.get('/', auth_middleware_1.authMiddleware, order_controller_1.default.getUserOrders.bind(order_controller_1.default));
router.get('/:id', auth_middleware_1.authMiddleware, order_controller_1.default.getOrderById.bind(order_controller_1.default));
router.put('/:id/cancel', auth_middleware_1.authMiddleware, order_controller_1.default.cancelOrder.bind(order_controller_1.default));
exports.default = router;
