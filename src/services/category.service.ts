import prisma from '../config/database';
import { CreateCategoryRequest } from '../types';

export class CategoryService {
  async createCategory(data: CreateCategoryRequest) {
    // Check if category already exists
    const existing = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('Category with this name already exists');
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });

    return category;
  }

  async getAllCategories(activeOnly?: boolean) {
    const where: any = {};
    
    if (activeOnly !== undefined) {
      where.isActive = activeOnly;
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return categories;
  }

  async getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }

  async updateCategory(id: string, data: Partial<CreateCategoryRequest>) {
    // Check if trying to update to an existing name
    if (data.name) {
      const existing = await prisma.category.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error('Category with this name already exists');
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return category;
  }

  async deleteCategory(id: string, force?: boolean) {
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    if (category.products.length > 0 && !force) {
      // Soft delete by setting isActive to false
      await prisma.category.update({
        where: { id },
        data: { isActive: false },
      });
      return { success: true, message: 'Category has products, deactivated instead' };
    }

    await prisma.category.delete({
      where: { id },
    });

    return { success: true };
  }
}

export default new CategoryService();
