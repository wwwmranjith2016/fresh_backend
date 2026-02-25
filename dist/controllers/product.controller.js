"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = __importDefault(require("../services/product.service"));
const response_util_1 = require("../utils/response.util");
const fileUpload_util_1 = require("../utils/fileUpload.util");
class ProductController {
    async createProduct(req, res) {
        try {
            if (req.user?.role !== 'ADMIN') {
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const data = req.body;
            // Convert string values to correct types
            data.price = parseFloat(data.price);
            if (data.discountPercentage !== undefined) {
                data.discountPercentage = parseFloat(data.discountPercentage);
            }
            if (data.discountPrice !== undefined) {
                data.discountPrice = parseFloat(data.discountPrice);
            }
            if (data.stockQuantity !== undefined) {
                data.stockQuantity = parseInt(data.stockQuantity, 10);
            }
            if (data.minOrderQuantity !== undefined) {
                data.minOrderQuantity = parseInt(data.minOrderQuantity, 10);
            }
            if (data.maxOrderQuantity !== undefined) {
                data.maxOrderQuantity = parseInt(data.maxOrderQuantity, 10);
            }
            if (data.isFeatured !== undefined) {
                data.isFeatured = data.isFeatured === 'true';
            }
            if (data.available !== undefined) {
                data.available = data.available === 'true';
            }
            // Handle image upload
            if (req.file) {
                data.imageUrl = (0, fileUpload_util_1.getFileUrl)(req.file.filename);
            }
            else {
                return (0, response_util_1.sendError)(res, 'Product image is required', 400);
            }
            // Validate required fields
            if (!data.name || !data.description || !data.price || !data.categoryId || !data.unitId) {
                return (0, response_util_1.sendError)(res, 'Required fields: name, description, price, categoryId, unitId', 400);
            }
            // Validate price is positive
            if (data.price <= 0) {
                return (0, response_util_1.sendError)(res, 'Price must be greater than 0', 400);
            }
            // Validate discount percentage if provided
            if (data.discountPercentage !== undefined && (data.discountPercentage < 0 || data.discountPercentage > 100)) {
                return (0, response_util_1.sendError)(res, 'Discount percentage must be between 0 and 100', 400);
            }
            // Validate discount price if provided
            if (data.discountPrice !== undefined && data.discountPrice < 0) {
                return (0, response_util_1.sendError)(res, 'Discount price must be greater than or equal to 0', 400);
            }
            // Validate stock quantity if provided
            if (data.stockQuantity !== undefined && data.stockQuantity < 0) {
                return (0, response_util_1.sendError)(res, 'Stock quantity must be greater than or equal to 0', 400);
            }
            // Validate min order quantity if provided
            if (data.minOrderQuantity !== undefined && data.minOrderQuantity < 1) {
                return (0, response_util_1.sendError)(res, 'Minimum order quantity must be at least 1', 400);
            }
            // Validate max order quantity if provided
            if (data.maxOrderQuantity !== undefined && data.maxOrderQuantity < 1) {
                return (0, response_util_1.sendError)(res, 'Maximum order quantity must be at least 1', 400);
            }
            // Validate offer dates if both provided
            if (data.offerValidFrom && data.offerValidUntil) {
                const validFrom = new Date(data.offerValidFrom);
                const validUntil = new Date(data.offerValidUntil);
                if (validFrom >= validUntil) {
                    return (0, response_util_1.sendError)(res, 'Offer valid from date must be before valid until date', 400);
                }
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
            const { available, isFeatured, categoryId, unitId, tags, minPrice, maxPrice, hasDiscount, } = req.query;
            // DEBUG: Log the received query params
            console.log('=== Product Filter Debug ===');
            console.log('categoryId:', categoryId);
            console.log('isFeatured:', isFeatured);
            console.log('available:', available);
            console.log('unitId:', unitId);
            console.log('=== End Debug ===');
            const filters = {};
            if (available !== undefined) {
                filters.available = available === 'true' ? true : available === 'false' ? false : undefined;
            }
            if (isFeatured !== undefined) {
                filters.isFeatured = isFeatured === 'true';
            }
            if (categoryId) {
                filters.categoryId = categoryId;
            }
            if (unitId) {
                filters.unitId = unitId;
            }
            if (tags) {
                filters.tags = Array.isArray(tags) ? tags : [tags];
            }
            if (minPrice) {
                filters.minPrice = parseFloat(minPrice);
            }
            if (maxPrice) {
                filters.maxPrice = parseFloat(maxPrice);
            }
            if (hasDiscount !== undefined) {
                filters.hasDiscount = hasDiscount === 'true';
            }
            const products = await product_service_1.default.getAllProducts(filters);
            // Prevent caching
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
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
            // Handle image upload if a new file is provided
            if (req.file) {
                data.imageUrl = (0, fileUpload_util_1.getFileUrl)(req.file.filename);
            }
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
    async reorderProducts(req, res) {
        try {
            if (req.user?.role !== 'ADMIN') {
                return (0, response_util_1.sendError)(res, 'Unauthorized: Admin access required', 403);
            }
            const { products } = req.body;
            if (!Array.isArray(products) || products.length === 0) {
                return (0, response_util_1.sendError)(res, 'Products array is required', 400);
            }
            const result = await product_service_1.default.reorderProducts(products);
            return (0, response_util_1.sendSuccess)(res, result, 'Products reordered successfully');
        }
        catch (error) {
            return (0, response_util_1.sendError)(res, error.message || 'Failed to reorder products', 400);
        }
    }
}
exports.ProductController = ProductController;
exports.default = new ProductController();
