import prisma from '../config/database';
import { CreateAddressRequest } from '../types';

export class AddressService {
  async createAddress(userId: string, data: CreateAddressRequest) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label: data.label,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        isDefault: data.isDefault || false,
      },
    });

    return address;
  }

  async getUserAddresses(userId: string) {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });

    return addresses;
  }

  async getAddressById(id: string, userId: string) {
    const address = await prisma.address.findFirst({
      where: { id, userId },
    });

    if (!address) {
      throw new Error('Address not found');
    }

    return address;
  }

  async updateAddress(id: string, userId: string, data: Partial<CreateAddressRequest>) {
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.updateMany({
      where: { id, userId },
      data,
    });

    if (address.count === 0) {
      throw new Error('Address not found');
    }

    return await this.getAddressById(id, userId);
  }

  async deleteAddress(id: string, userId: string) {
    const result = await prisma.address.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new Error('Address not found');
    }

    return { success: true };
  }
}

export default new AddressService();
