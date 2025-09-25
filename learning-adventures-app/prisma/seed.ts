import { PrismaClient } from '@/lib/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for all test accounts
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Clear existing test data (optional - be careful in production!)
  console.log('🧹 Cleaning existing test users...');
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          'student@test.com',
          'teacher@test.com',
          'parent@test.com',
          'admin@test.com',
        ]
      }
    }
  });

  // Create Student test user
  console.log('👨‍🎓 Creating Student test user...');
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@test.com',
      name: 'Alex Student',
      password: hashedPassword,
      role: 'STUDENT',
      gradeLevel: '3',
      subjects: ['math', 'science', 'english'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create Teacher test user
  console.log('👩‍🏫 Creating Teacher test user...');
  const teacherUser = await prisma.user.create({
    data: {
      email: 'teacher@test.com',
      name: 'Sarah Teacher',
      password: hashedPassword,
      role: 'TEACHER',
      subjects: ['math', 'science', 'english', 'history', 'interdisciplinary'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create Parent test user
  console.log('👨‍👩‍👧‍👦 Creating Parent test user...');
  const parentUser = await prisma.user.create({
    data: {
      email: 'parent@test.com',
      name: 'Maria Parent',
      password: hashedPassword,
      role: 'PARENT',
      subjects: ['math', 'science', 'english'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create Admin test user
  console.log('👩‍💼 Creating Admin test user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@test.com',
      name: 'Jordan Admin',
      password: hashedPassword,
      role: 'ADMIN',
      subjects: ['math', 'science', 'english', 'history', 'interdisciplinary'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Credentials Created:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎓 Student: student@test.com / password123');
  console.log('   Name: Alex Student');
  console.log('   Grade: 3rd Grade');
  console.log('   Subjects: Math, Science, English\n');

  console.log('👩‍🏫 Teacher: teacher@test.com / password123');
  console.log('   Name: Sarah Teacher');
  console.log('   Subjects: All subjects\n');

  console.log('👨‍👩‍👧‍👦 Parent: parent@test.com / password123');
  console.log('   Name: Maria Parent');
  console.log('   Subjects: Math, Science, English\n');

  console.log('👩‍💼 Admin: admin@test.com / password123');
  console.log('   Name: Jordan Admin');
  console.log('   Subjects: All subjects');
  console.log('   Access: Full platform administration\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Create some sample progress data for the student
  console.log('📈 Adding sample progress data...');

  // Add some user progress entries for the student
  const progressEntries = [
    {
      userId: studentUser.id,
      adventureId: 'fraction-pizza-party',
      adventureType: 'lesson',
      category: 'math',
      status: 'COMPLETED',
      score: 95,
      timeSpent: 18,
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
    {
      userId: studentUser.id,
      adventureId: 'solar-system-explorer',
      adventureType: 'lesson',
      category: 'science',
      status: 'IN_PROGRESS',
      score: null,
      timeSpent: 8,
      completedAt: null,
    },
    {
      userId: studentUser.id,
      adventureId: 'math-treasure-hunt',
      adventureType: 'game',
      category: 'math',
      status: 'COMPLETED',
      score: 87,
      timeSpent: 12,
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ];

  for (const progressData of progressEntries) {
    await prisma.userProgress.create({
      data: progressData,
    });
  }

  // Add some achievements for the student
  console.log('🏆 Adding sample achievements...');

  const achievements = [
    {
      userId: studentUser.id,
      type: 'completion',
      title: 'Math Explorer',
      description: 'Completed your first math adventure!',
      category: 'math',
      earnedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: studentUser.id,
      type: 'streak',
      title: 'Learning Streak',
      description: 'Completed adventures 2 days in a row!',
      category: null,
      earnedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ];

  for (const achievementData of achievements) {
    await prisma.userAchievement.create({
      data: achievementData,
    });
  }

  console.log('🎉 Sample data added successfully!');
  console.log('\n💡 Pro Tip: You can run "npm run db:reset" to clear and re-seed the database anytime.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });