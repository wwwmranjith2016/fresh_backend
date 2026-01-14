import prisma from '../config/database';

export class CustomerService {
  async getLastCustomer() {
    const lastCustomer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastCustomer) {
      throw new Error('No customers found');
    }

    return lastCustomer;
  }
}

export default new CustomerService();