"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = __importDefault(require("../controllers/notification.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, notification_controller_1.default.getUserNotifications.bind(notification_controller_1.default));
router.put('/:id/read', auth_middleware_1.authMiddleware, notification_controller_1.default.markAsRead.bind(notification_controller_1.default));
router.put('/read-all', auth_middleware_1.authMiddleware, notification_controller_1.default.markAllAsRead.bind(notification_controller_1.default));
exports.default = router;
