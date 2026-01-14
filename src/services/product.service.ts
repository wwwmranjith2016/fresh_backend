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
      },
    });

    return product;
  }

  async getAllProducts(available?: boolean) {
    const where = available !== undefined ? { available } : {};

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
