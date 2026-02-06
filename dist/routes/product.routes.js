"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const fileUpload_util_1 = require("../utils/fileUpload.util");
const router = (0, express_1.Router)();
router.get('/', product_controller_1.default.getAllProducts.bind(product_controller_1.default));
router.get('/:id', product_controller_1.default.getProductById.bind(product_controller_1.default));
router.post('/', auth_middleware_1.authMiddleware, fileUpload_util_1.uploadProductImage, product_controller_1.default.createProduct.bind(product_controller_1.default));
router.put('/:id', auth_middleware_1.authMiddleware, fileUpload_util_1.uploadProductImage, product_controller_1.default.updateProduct.bind(product_controller_1.default));
router.delete('/:id', auth_middleware_1.authMiddleware, product_controller_1.default.deleteProduct.bind(product_controller_1.default));
exports.default = router;
