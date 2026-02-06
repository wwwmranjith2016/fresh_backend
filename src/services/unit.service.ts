import prisma from '../config/database';
import { CreateUnitRequest } from '../types';

export class UnitService {
  async createUnit(data: CreateUnitRequest) {
    // Check if unit already exists
    const existing = await prisma.unit.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('Unit with this name already exists');
    }

    const unit = await prisma.unit.create({
      data: {
        name: data.name,
        symbol: data.symbol,
        description: data.description,
      },
    });

    return unit;
  }

  async getAllUnits(activeOnly?: boolean) {
    const where: any = {};
    
    if (activeOnly !== undefined) {
      where.isActive = activeOnly;
    }

    const units = await prisma.unit.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    return units;
  }

  async getUnitById(id: string) {
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!unit) {
      throw new Error('Unit not found');
    }

    return unit;
  }

  async updateUnit(id: string, data: Partial<CreateUnitRequest>) {
    // Check if trying to update to an existing name
    if (data.name) {
      const existing = await prisma.unit.findFirst({
        where: {
          name: data.name,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error('Unit with this name already exists');
      }
    }

    const unit = await prisma.unit.update({
      where: { id },
      data,
    });

    return unit;
  }

  async deleteUnit(id: string, force?: boolean) {
    // Check if unit has products
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: { products: true },
    });

    if (!unit) {
      throw new Error('Unit not found');
    }

    if (unit.products.length > 0 && !force) {
      // Soft delete by setting isActive to false
      await prisma.unit.update({
        where: { id },
        data: { isActive: false },
      });
      return { success: true, message: 'Unit has products, deactivated instead' };
    }

    await prisma.unit.delete({
      where: { id },
    });

    return { success: true };
  }
}

export default new UnitService();
