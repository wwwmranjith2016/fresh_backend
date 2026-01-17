import prisma from './config/database';

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        phone: true,
        name: true,
        role: true,
        fcmToken: true,
      }
    });
    console.log('Users in database:');
    console.table(users);

    const orders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, phone: true, fcmToken: true } }
      }
    });
    console.log('\nRecent orders:');
    console.table(orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer.name,
      status: o.status,
      customerToken: o.customer.fcmToken ? 'Exists' : 'MISSING'
    })));

    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, phone: true, fcmToken: true }
    });
    console.log('\nAdmins and their tokens:');
    console.table(admins.map(a => ({
      ...a,
      fcmToken: a.fcmToken ? 'Exists' : 'MISSING'
    })));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
