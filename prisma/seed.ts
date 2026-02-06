import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { phone: '+918248904924' },
    update: {},
    create: {
      phone: '+918248904924',
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

  // Create Categories
  console.log('\n📦 Creating categories...');
  const categories = [
    { name: 'Chicken', description: 'Fresh chicken products' },
    { name: 'Mutton', description: 'Fresh mutton/lamb products' },
    { name: 'Egg', description: 'Fresh eggs' },
    { name: 'Fish', description: 'Fresh fish and seafood' },
  ];

  const categoryMap: Record<string, string> = {};
  
  for (const cat of categories) {
    const existing = await prisma.category.findUnique({
      where: { name: cat.name },
    });
    
    if (!existing) {
      const created = await prisma.category.create({ data: cat });
      categoryMap[cat.name] = created.id;
      console.log(`  ✅ Category created: ${cat.name}`);
    } else {
      categoryMap[cat.name] = existing.id;
      console.log(`  ⏭️  Category already exists: ${cat.name}`);
    }
  }

  // Create Units
  console.log('\n⚖️  Creating units...');
  const units = [
    { name: 'Kilo Gram', symbol: 'kg', description: 'Weight in kilograms' },
    { name: 'Pieces', symbol: 'pcs', description: 'Count in pieces' },
  ];

  const unitMap: Record<string, string> = {};
  
  for (const unit of units) {
    const existing = await prisma.unit.findUnique({
      where: { name: unit.name },
    });
    
    if (!existing) {
      const created = await prisma.unit.create({ data: unit });
      unitMap[unit.name] = created.id;
      console.log(`  ✅ Unit created: ${unit.name}`);
    } else {
      unitMap[unit.name] = existing.id;
      console.log(`  ⏭️  Unit already exists: ${unit.name}`);
    }
  }

  // Create Products with proper categoryId and unitId
  console.log('\n🍗 Creating products...');
  const products = [
    {
      name: 'Whole Chicken',
      description: 'Fresh whole chicken, cleaned and ready to cook',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400',
      price: 250,
      categoryName: 'Chicken',
      unitName: 'Kilo Gram',
      available: true,
    },
    {
      name: 'Chicken Breast',
      description: 'Boneless chicken breast, perfect for grilling',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400',
      price: 320,
      categoryName: 'Chicken',
      unitName: 'Kilo Gram',
      available: true,
    },
    {
      name: 'Chicken Thighs',
      description: 'Tender chicken thighs with bone',
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
      price: 280,
      categoryName: 'Chicken',
      unitName: 'Kilo Gram',
      available: true,
    },
    {
      name: 'Chicken Wings',
      description: 'Fresh chicken wings, great for BBQ',
      imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
      price: 300,
      categoryName: 'Chicken',
      unitName: 'Kilo Gram',
      available: true,
    },
    {
      name: 'Mutton Curry Cut',
      description: 'Fresh mutton curry cut, perfect for curries',
      imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=400',
      price: 450,
      categoryName: 'Mutton',
      unitName: 'Kilo Gram',
      available: true,
    },
    {
      name: 'Mutton Leg',
      description: 'Fresh mutton leg piece',
      imageUrl: 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=400',
      price: 420,
      categoryName: 'Mutton',
      unitName: 'Kilo Gram',
      available: true,
    },
    {
      name: 'Farm Fresh Eggs',
      description: 'Fresh farm eggs, set of 6',
      imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
      price: 60,
      categoryName: 'Egg',
      unitName: 'Pieces',
      available: true,
    },
    {
      name: 'Fish Curry Cut',
      description: 'Fresh fish curry cut',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
      price: 350,
      categoryName: 'Fish',
      unitName: 'Kilo Gram',
      available: true,
    },
    {
      name: 'Fish Whole',
      description: 'Fresh whole fish',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400',
      price: 380,
      categoryName: 'Fish',
      unitName: 'Kilo Gram',
      available: true,
    },
    {
      name: 'Prawns',
      description: 'Fresh prawns',
      imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400',
      price: 500,
      categoryName: 'Fish',
      unitName: 'Kilo Gram',
      available: true,
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });
    
    if (!existing) {
      const { categoryName, unitName, ...productData } = product;
      const created = await prisma.product.create({
        data: {
          ...productData,
          categoryId: categoryMap[categoryName],
          unitId: unitMap[unitName],
        },
      });
      console.log(`  ✅ ${created.name}`);
    } else {
      console.log(`  ⏭️  ${product.name} (already exists)`);
    }
  }

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin:');
  console.log('   Phone: +918248904924');
  console.log('   Password: admin123');
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
