import prisma from './config/database';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    const phone = '8248904924'; // Without country code
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      console.log('❌ User with this phone already exists:', existingUser);
      return;
    }

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        name: 'Admin User',
        email: 'admin@freshchicken.com',
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Phone:', admin.phone);
    console.log('👤 Name:', admin.name);
    console.log('📧 Email:', admin.email);
    console.log('👑 Role:', admin.role);
    console.log('🔑 Password:', password);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✨ Use these credentials to login in your app');
  } catch (error: any) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
