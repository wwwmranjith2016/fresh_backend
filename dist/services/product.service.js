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
                categoryId: data.categoryId,
                unitId: data.unitId,
                discountPercentage: data.discountPercentage,
                discountPrice: data.discountPrice,
                offerTitle: data.offerTitle,
                offerDescription: data.offerDescription,
                offerValidFrom: data.offerValidFrom ? new Date(data.offerValidFrom) : undefined,
                offerValidUntil: data.offerValidUntil ? new Date(data.offerValidUntil) : undefined,
                isFeatured: data.isFeatured ?? false,
                stockQuantity: data.stockQuantity ?? 0,
                minOrderQuantity: data.minOrderQuantity ?? 1,
                maxOrderQuantity: data.maxOrderQuantity,
                tags: data.tags ?? [],
            },
        });
        return product;
    }
    async getAllProducts(filters) {
        // DEBUG: Log the filters
        console.log('=== ProductService Filters ===');
        console.log('filters:', JSON.stringify(filters, null, 2));
        const where = {};
        if (filters?.available !== undefined) {
            where.available = filters.available;
        }
        if (filters?.isFeatured !== undefined) {
            where.isFeatured = filters.isFeatured;
        }
        if (filters?.categoryId) {
            where.categoryId = filters.categoryId;
        }
        if (filters?.unitId) {
            where.unitId = filters.unitId;
        }
        if (filters?.tags && filters.tags.length > 0) {
            where.tags = {
                hasSome: filters.tags,
            };
        }
        if (filters?.minPrice !== undefined || filters?.maxPrice !== undefined) {
            where.price = {};
            if (filters.minPrice !== undefined) {
                where.price.gte = filters.minPrice;
            }
            if (filters.maxPrice !== undefined) {
                where.price.lte = filters.maxPrice;
            }
        }
        if (filters?.hasDiscount !== undefined) {
            if (filters.hasDiscount) {
                where.OR = [
                    { discountPercentage: { gt: 0 } },
                    { discountPrice: { gt: 0 } },
                ];
            }
            else {
                where.AND = [
                    { discountPercentage: null },
                    { discountPrice: null },
                ];
            }
        }
        const products = await database_1.default.product.findMany({
            where,
            include: {
                category: true,
                unit: true,
            },
            orderBy: [
                { categoryId: 'asc' },
                { displayOrder: 'asc' },
            ],
        });
        return products;
    }
    async getProductById(id) {
        const product = await database_1.default.product.findUnique({
            where: { id },
            include: {
                category: true,
                unit: true,
            },
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
    async reorderProducts(products) {
        // Update all products with their new display order
        const updates = products.map((product) => database_1.default.product.update({
            where: { id: product.id },
            data: { displayOrder: product.displayOrder },
        }));
        await database_1.default.$transaction(updates);
        return { success: true, updated: products.length };
    }
}
exports.ProductService = ProductService;
exports.default = new ProductService();
