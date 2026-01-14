"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = __importDefault(require("../controllers/address.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, address_controller_1.default.getUserAddresses.bind(address_controller_1.default));
router.post('/', auth_middleware_1.authMiddleware, address_controller_1.default.createAddress.bind(address_controller_1.default));
router.put('/:id', auth_middleware_1.authMiddleware, address_controller_1.default.updateAddress.bind(address_controller_1.default));
router.delete('/:id', auth_middleware_1.authMiddleware, address_controller_1.default.deleteAddress.bind(address_controller_1.default));
exports.default = router;
