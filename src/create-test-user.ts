import prisma from './config/database';
import bcrypt from 'bcryptjs';

async function createTestUser() {
  try {
    const phone = '9876543210'; // Test user phone
    const password = 'test123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      console.log('❌ User with this phone already exists:', existingUser);
      return;
    }

    // Create test customer user
    const testUser = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name: 'Test Customer',
        email: 'testcustomer@freshchicken.com',
        role: 'CUSTOMER',
      },
    });

    console.log('✅ Test customer user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Phone:', testUser.phone);
    console.log('👤 Name:', testUser.name);
    console.log('📧 Email:', testUser.email);
    console.log('👥 Role:', testUser.role);
    console.log('🔑 Password:', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Use these credentials to test customer features');
  } catch (error: any) {
    console.error('❌ Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
