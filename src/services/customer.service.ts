import prisma from '../config/database';
import { UserRole } from '@prisma/client';

export const getCustomerById = async (customerId: string) => {
  return await prisma.user.findUnique({
    where: { id: customerId, role: UserRole.CUSTOMER },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    }
  });
};

export const updateCustomer = async (customerId: string, updateData: any) => {
  return await prisma.user.update({
    where: { id: customerId, role: UserRole.CUSTOMER },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    }
  });
};