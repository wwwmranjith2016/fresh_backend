"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const database_1 = __importDefault(require("../config/database"));
class ProductService {
    async createProduct(data) {
        const product = await database_1.default.product.create({
            data: {
                name: data.name,
                description: data.description,
                imageUrl: data.imageUrl,
                price: data.price,
                category: data.category,
                unit: data.unit,
            },
        });
        return product;
    }
    async getAllProducts(available) {
        const where = available !== undefined ? { available } : {};
        const products = await database_1.default.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return products;
    }
    async getProductById(id) {
        const product = await database_1.default.product.findUnique({
            where: { id },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    }
    async updateProduct(id, data) {
        const product = await database_1.default.product.update({
            where: { id },
            data,
        });
        return product;
    }
    async deleteProduct(id) {
        await database_1.default.product.delete({
            where: { id },
        });
        return { success: true };
    }
}
exports.ProductService = ProductService;
exports.default = new ProductService();
