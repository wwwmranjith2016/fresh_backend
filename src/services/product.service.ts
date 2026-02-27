import prisma from '../config/database';
import { CreateProductRequest } from '../types';

export class ProductService {
  async validateOfferId(offerId: string) {
    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new Error('Offer not found');
    }

    return offer;
  }

  async createProduct(data: CreateProductRequest) {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image, // Base64 encoded image
        price: data.price,
        categoryId: data.categoryId,
        unitId: data.unitId,
        offerId: data.offerId,
        discountPercentage: data.discountPercentage,
        discountPrice: data.discountPrice,
        isFeatured: data.isFeatured ?? false,
        stockQuantity: data.stockQuantity ?? 0,
        minOrderQuantity: data.minOrderQuantity ?? 1,
        maxOrderQuantity: data.maxOrderQuantity,
        displayOrder: data.displayOrder ?? 0, // Position/order
        tags: data.tags ?? [],
      },
    });

    return product;
  }

  async getAllProducts(filters?: {
    available?: boolean;
    isFeatured?: boolean;
    categoryId?: string;
    unitId?: string;
    tags?: string[];
    minPrice?: number;
    maxPrice?: number;
    hasDiscount?: boolean;
  }) {
    // DEBUG: Log the filters
    console.log('=== ProductService Filters ===');
    console.log('filters:', JSON.stringify(filters, null, 2));

    const where: any = {};

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
      } else {
        where.AND = [
          { discountPercentage: null },
          { discountPrice: null },
        ];
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        unit: true,
        offer: true,
      },
      orderBy: [
        { categoryId: 'asc' },
        { displayOrder: 'asc' },
      ],
    });

    return products;
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        unit: true,
        offer: true,
      },
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

  async reorderProducts(products: { id: string; displayOrder: number }[]) {
    // Update all products with their new display order
    const updates = products.map((product) =>
      prisma.product.update({
        where: { id: product.id },
        data: { displayOrder: product.displayOrder },
      })
    );

    await prisma.$transaction(updates);

    return { success: true, updated: products.length };
  }
}

export default new ProductService();
