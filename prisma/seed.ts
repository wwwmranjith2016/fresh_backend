import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { phone: '8248904925' },
    update: {},
    create: {
      phone: '8248904925',
      password: adminPassword,
      name: 'Admin User',
      email: 'admin@freshchicken.com',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.name);

  const customer = await prisma.user.upsert({
    where: { phone: '+919876543211' },
    update: {},
    create: {
      phone: '+919876543211',
      password: customerPassword,
      name: 'Test Customer',
      email: 'customer@test.com',
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Customer user created:', customer.name);

  const address = await prisma.address.upsert({
    where: { id: 'default-address-id' },
    update: {},
    create: {
      id: 'default-address-id',
      userId: customer.id,
      label: 'Home',
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      latitude: 19.0760,
      longitude: 72.8777,
      isDefault: true,
    },
  });
  console.log('✅ Address created:', address.label);

  const products = [
    {
      name: 'Whole Chicken',
      description: 'Fresh whole chicken, cleaned and ready to cook',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400',
      price: 250,
      category: 'Whole Bird',
      unit: 'kg',
      available: true,
    },
    {
      name: 'Chicken Breast',
      description: 'Boneless chicken breast, perfect for grilling',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
      price: 320,
      category: 'Boneless',
      unit: 'kg',
      available: true,
    },
    {
      name: 'Chicken Thighs',
      description: 'Tender chicken thighs with bone',
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      price: 280,
      category: 'With Bone',
      unit: 'kg',
      available: true,
    },
    {
      name: 'Chicken Wings',
      description: 'Fresh chicken wings, great for BBQ',
      imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
      price: 300,
      category: 'Wings',
      unit: 'kg',
      available: true,
    },
    {
      name: 'Chicken Drumsticks',
      description: 'Juicy chicken drumsticks',
      imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e36f?w=400',
      price: 290,
      category: 'With Bone',
      unit: 'kg',
      available: true,
    },
    {
      name: 'Chicken Mince',
      description: 'Freshly minced chicken, ideal for kebabs',
      imageUrl: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400',
      price: 310,
      category: 'Boneless',
      unit: 'kg',
      available: true,
    },
    {
      name: 'Chicken Liver',
      description: 'Fresh chicken liver, rich in nutrients',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400',
      price: 180,
      category: 'Organ Meat',
      unit: 'kg',
      available: true,
    },
    {
      name: 'Chicken Leg Quarters',
      description: 'Chicken leg quarters with thigh and drumstick',
      imageUrl: 'https://images.unsplash.com/photo-1562158147-f8b6ce5494e2?w=400',
      price: 270,
      category: 'With Bone',
      unit: 'kg',
      available: true,
    },
  ];

  console.log('🍗 Creating products...');
  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    
    if (!existing) {
      const created = await prisma.product.create({
        data: product,
      });
      console.log(`  ✅ ${created.name}`);
    } else {
      console.log(`  ⏭️  ${product.name} (already exists)`);
    }
  }

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin:');
  console.log('   Phone: 8248904925');
  console.log('   Password: abcd1234');
  console.log('\n   Customer:');
  console.log('   Phone: +919876543211');
  console.log('   Password: customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
