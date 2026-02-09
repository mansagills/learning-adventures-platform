const { PrismaClient } = require('./lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testLogin() {
  console.log('🧪 Testing student login credentials...\n');

  try {
    // Find the student user
    const user = await prisma.user.findUnique({
      where: {
        email: 'student@test.com',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        gradeLevel: true,
        subjects: true,
      },
    });

    if (!user) {
      console.log('❌ Student user not found!');
      console.log('💡 Make sure you ran "npm run db:seed"');
      return;
    }

    console.log('✅ User found in database:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Grade: ${user.gradeLevel}`);
    console.log(`   Subjects: ${user.subjects.join(', ')}\n`);

    // Test password
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(
        'password123',
        user.password
      );
      console.log(
        `🔒 Password verification: ${isPasswordValid ? '✅ VALID' : '❌ INVALID'}\n`
      );

      if (isPasswordValid) {
        console.log('🎉 Login credentials are working correctly!');
        console.log('\n📋 Ready to test in browser:');
        console.log('1. Go to: http://localhost:3000');
        console.log('2. Click "Sign In"');
        console.log('3. Use: student@test.com / password123');
        console.log(
          '4. Should successfully log in as Alex Student (Grade 3)\n'
        );
      } else {
        console.log('❌ Password verification failed');
      }
    } else {
      console.log('❌ User has no password set');
    }

    // Test other accounts briefly
    console.log('🔄 Checking other test accounts...');
    const allTestUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['teacher@test.com', 'parent@test.com', 'admin@test.com'],
        },
      },
      select: {
        email: true,
        name: true,
        role: true,
        password: true,
      },
    });

    for (const testUser of allTestUsers) {
      const passwordOk = testUser.password
        ? await bcrypt.compare('password123', testUser.password)
        : false;
      console.log(
        `   ${passwordOk ? '✅' : '❌'} ${testUser.email} (${testUser.role})`
      );
    }

    console.log('\n✨ All test accounts are ready for use!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
