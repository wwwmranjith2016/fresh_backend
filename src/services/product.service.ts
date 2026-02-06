import prisma from '../config/database';
import { CreateProductRequest } from '../types';

export class ProductService {
  async createProduct(data: CreateProductRequest) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        price: data.price,
        category: data.category,
        unit: data.unit,
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

  async getAllProducts(filters?: {
    available?: boolean;
    isFeatured?: boolean;
    category?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    hasDiscount?: boolean;
  }) {
    const where: any = {};

    if (filters?.available !== undefined) {
      where.available = filters.available;
    }

    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters?.category) {
      where.category = filters.category;
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
      } else {
        where.AND = [
          { discountPercentage: null },
          { discountPrice: null },
        ];
      }
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return products;
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async updateProduct(id: string, data: Partial<CreateProductRequest> & { available?: boolean }) {
    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return product;
  }

  async deleteProduct(id: string) {
    await prisma.product.delete({
      where: { id },
    });

    return { success: true };
  }
}

export default new ProductService();
