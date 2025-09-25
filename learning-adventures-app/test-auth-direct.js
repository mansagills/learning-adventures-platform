const { PrismaClient } = require('./lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testDirectAuth() {
  console.log('🔍 Testing direct authentication simulation...\n');

  try {
    // Simulate the authorize function logic
    const credentials = {
      email: 'student@test.com',
      password: 'password123'
    };

    console.log('📥 Simulated credentials:', {
      email: credentials.email,
      hasPassword: !!credentials.password
    });

    if (!credentials?.email || !credentials?.password) {
      console.log('❌ Missing credentials');
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        email: credentials.email,
      },
    });

    console.log('👤 User lookup result:', {
      found: !!user,
      hasPassword: !!user?.password,
      userId: user?.id,
      role: user?.role
    });

    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password
    );

    console.log('🔒 Password validation:', { valid: isPasswordValid });

    if (!isPasswordValid) {
      console.log('❌ Invalid password');
      return;
    }

    console.log('✅ Authentication would succeed!');
    console.log('🎯 User object that would be returned:');
    console.log({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      gradeLevel: user.gradeLevel,
      subjects: user.subjects,
      image: user.image,
    });

  } catch (error) {
    console.error('💥 Error during auth test:', error.message);
    console.error('📍 Stack trace:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectAuth();