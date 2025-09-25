const { PrismaClient } = require('./lib/generated/prisma');

const prisma = new PrismaClient();

async function verifyUsers() {
  console.log('🔍 Checking database for test users...\n');

  try {
    const users = await prisma.user.findMany({
      where: {
        email: {
          in: ['student@test.com', 'teacher@test.com', 'parent@test.com', 'admin@test.com']
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No test users found in database!');
      console.log('💡 Run "npm run db:seed" to create test users.');
      return;
    }

    console.log(`✅ Found ${users.length} test users:\n`);

    users.forEach(user => {
      console.log(`📧 ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password Hash: ${user.password ? 'EXISTS' : 'MISSING'}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}\n`);
    });

    // Test password verification
    console.log('🔒 Testing password verification for student account...');
    const bcrypt = require('bcryptjs');

    const studentUser = users.find(u => u.email === 'student@test.com');
    if (studentUser && studentUser.password) {
      const isValid = await bcrypt.compare('password123', studentUser.password);
      console.log(`   Password "password123" is ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    } else {
      console.log('   ❌ Student user not found or has no password');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUsers();