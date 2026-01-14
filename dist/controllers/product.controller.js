"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = __importDefault(require("../services/product.service"));
const response_util_1 = require("../utils/response.util");
class ProductController {
    async createProduct(req, res) {
        try {
            if (req.user?.role !== 'ADMIN') {
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const data = req.body;
            if (!data.name || !data.description || !data.price || !data.category || !data.unit) {
                return (0, response_util_1.sendError)(res, 'All product fields are required', 400);
            }
            const product = await product_service_1.default.createProduct(data);
            return (0, response_util_1.sendSuccess)(res, product, 'Product created successfully', 201);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to create product', 400);
        }
    }
    async getAllProducts(req, res) {
        try {
            const { available } = req.query;
            const availableFilter = available === 'true' ? true : available === 'false' ? false : undefined;
            const products = await product_service_1.default.getAllProducts(availableFilter);
            return (0, response_util_1.sendSuccess)(res, products);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to fetch products', 400);
        }
    }
    async getProductById(req, res) {
        try {
            const { id } = req.params;
            const product = await product_service_1.default.getProductById(id);
            return (0, response_util_1.sendSuccess)(res, product);
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Product not found', 404);
        }
    }
    async updateProduct(req, res) {
        try {
            if (req.user?.role !== 'ADMIN') {
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const { id } = req.params;
            const data = req.body;
            const product = await product_service_1.default.updateProduct(id, data);
            return (0, response_util_1.sendSuccess)(res, product, 'Product updated successfully');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to update product', 400);
        }
    }
    async deleteProduct(req, res) {
        try {
            if (req.user?.role !== 'ADMIN') {
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const { id } = req.params;
            await product_service_1.default.deleteProduct(id);
            return (0, response_util_1.sendSuccess)(res, null, 'Product deleted successfully');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to delete product', 400);
        }
    }
}
exports.ProductController = ProductController;
exports.default = new ProductController();
