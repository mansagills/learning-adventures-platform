import { PrismaClient, Difficulty, LessonType } from '@prisma/client';
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
          // Demo accounts for investors/grant reviewers
          'demo.parent@learningadventures.io',
          'demo.teacher@learningadventures.io',
          'demo.admin@learningadventures.io',
        ],
      },
    },
  });

  // Clean existing demo child profiles
  await prisma.childProfile.deleteMany({
    where: {
      username: {
        in: ['DemoChild1', 'DemoChild2'],
      },
    },
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

  // ============================================================================
  // DEMO ACCOUNTS FOR INVESTORS/GRANT REVIEWERS
  // ============================================================================
  console.log('\n🎯 Creating demo accounts for presentations...');

  const demoPassword = await bcrypt.hash('demo2024', 10);

  // Demo Parent (for showing parent features)
  console.log('👨‍👩‍👧 Creating Demo Parent...');
  const demoParent = await prisma.user.create({
    data: {
      email: 'demo.parent@learningadventures.io',
      name: 'Demo Parent',
      password: demoPassword,
      role: 'PARENT',
      isVerifiedAdult: true,
      subjects: ['math', 'science', 'english'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Demo Teacher (for showing teacher features)
  console.log('👩‍🏫 Creating Demo Teacher...');
  const demoTeacher = await prisma.user.create({
    data: {
      email: 'demo.teacher@learningadventures.io',
      name: 'Demo Teacher',
      password: demoPassword,
      role: 'TEACHER',
      subjects: ['math', 'science', 'english', 'history', 'interdisciplinary'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Demo Admin (for showing admin/content features)
  console.log('👩‍💼 Creating Demo Admin...');
  const demoAdmin = await prisma.user.create({
    data: {
      email: 'demo.admin@learningadventures.io',
      name: 'Demo Admin',
      password: demoPassword,
      role: 'ADMIN',
      subjects: ['math', 'science', 'english', 'history', 'interdisciplinary'],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Demo Child Profiles (for showing child login flow)
  console.log('👧 Creating Demo Child accounts...');
  const childPinHash = await bcrypt.hash('1234', 10);

  const demoChild1 = await prisma.childProfile.create({
    data: {
      parentId: demoParent.id,
      displayName: 'Emma',
      username: 'DemoChild1',
      authCode: childPinHash,
      gradeLevel: '3',
      avatarId: 'fox',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const demoChild2 = await prisma.childProfile.create({
    data: {
      parentId: demoParent.id,
      displayName: 'Liam',
      username: 'DemoChild2',
      authCode: childPinHash,
      gradeLevel: '5',
      avatarId: 'dragon',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create premium subscriptions for demo accounts
  await prisma.subscription.create({
    data: {
      userId: demoParent.id,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  await prisma.subscription.create({
    data: {
      userId: demoTeacher.id,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  await prisma.subscription.create({
    data: {
      userId: demoAdmin.id,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  // Create Subscriptions for test users
  console.log('💳 Creating subscriptions for test users...');

  // Student: FREE tier
  await prisma.subscription.create({
    data: {
      userId: studentUser.id,
      tier: 'FREE',
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  // Teacher: PREMIUM tier (for testing premium features)
  await prisma.subscription.create({
    data: {
      userId: teacherUser.id,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  // Parent: FREE tier
  await prisma.subscription.create({
    data: {
      userId: parentUser.id,
      tier: 'FREE',
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  // Admin: PREMIUM tier
  await prisma.subscription.create({
    data: {
      userId: adminUser.id,
      tier: 'PREMIUM',
      status: 'ACTIVE',
      startDate: new Date(),
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Test Credentials Created:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎓 Student: student@test.com / password123');
  console.log('   Name: Alex Student');
  console.log('   Grade: 3rd Grade');
  console.log('   Subjects: Math, Science, English');
  console.log('   Subscription: FREE tier\n');

  console.log('👩‍🏫 Teacher: teacher@test.com / password123');
  console.log('   Name: Sarah Teacher');
  console.log('   Subjects: All subjects');
  console.log('   Subscription: PREMIUM tier (for testing)\n');

  console.log('👨‍👩‍👧‍👦 Parent: parent@test.com / password123');
  console.log('   Name: Maria Parent');
  console.log('   Subjects: Math, Science, English');
  console.log('   Subscription: FREE tier\n');

  console.log('👩‍💼 Admin: admin@test.com / password123');
  console.log('   Name: Jordan Admin');
  console.log('   Subjects: All subjects');
  console.log('   Subscription: PREMIUM tier');
  console.log('   Access: Full platform administration\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  console.log('\n🎯 DEMO ACCOUNTS (For Investors/Grant Reviewers):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👨‍👩‍👧 Demo Parent: demo.parent@learningadventures.io / demo2024');
  console.log(
    '   - Shows: Parent dashboard, child management, progress monitoring'
  );
  console.log('   - Subscription: PREMIUM\n');

  console.log('👩‍🏫 Demo Teacher: demo.teacher@learningadventures.io / demo2024');
  console.log('   - Shows: Teacher classroom, student oversight');
  console.log('   - Subscription: PREMIUM\n');

  console.log('👩‍💼 Demo Admin: demo.admin@learningadventures.io / demo2024');
  console.log('   - Shows: Admin panel, content upload, AI Studio');
  console.log('   - Subscription: PREMIUM\n');

  console.log('👧 Demo Children (Child Login Flow):');
  console.log('   Child 1: DemoChild1 / PIN: 1234 (Emma, Grade 3, Fox avatar)');
  console.log(
    '   Child 2: DemoChild2 / PIN: 1234 (Liam, Grade 5, Dragon avatar)'
  );
  console.log('   Login at: /child/login\n');

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
      data: progressData as any,
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

  // ============================================================================
  // SEED COURSES
  // ============================================================================

  console.log('\n📚 Seeding course system data...\n');

  // Course 1: Multiplication Mastery (Free, Beginner, Math)
  console.log('📘 Creating: Multiplication Mastery');
  const multiplicationCourse = await prisma.course.upsert({
    where: { slug: 'multiplication-mastery' },
    update: {},
    create: {
      title: 'Multiplication Mastery',
      slug: 'multiplication-mastery',
      description:
        'Master multiplication from basic concepts to advanced word problems. Perfect for grades 3-5 students learning their times tables and building confidence in mental math.',
      subject: 'math',
      gradeLevel: ['3-5'],
      difficulty: Difficulty.BEGINNER,
      isPremium: false,
      isPublished: true,
      thumbnailUrl: '/images/courses/multiplication.jpg',
      estimatedMinutes: 180,
      totalXP: 575,
      prerequisiteCourseIds: [],
      lessons: {
        create: [
          {
            order: 1,
            title: 'What is Multiplication?',
            description:
              'Learn the basics of multiplication and how it relates to repeated addition. Understand why multiplication is useful in everyday life.',
            type: LessonType.INTERACTIVE,
            contentPath: '/lessons/multiplication/intro.html',
            duration: 15,
            xpReward: 50,
            requiredScore: null,
          },
          {
            order: 2,
            title: 'Times Tables 1-5',
            description:
              'Practice multiplication tables from 1 to 5 through fun interactive games and exercises.',
            type: LessonType.GAME,
            contentPath: 'times-tables-1-5',
            duration: 20,
            xpReward: 75,
            requiredScore: 70,
          },
          {
            order: 3,
            title: 'Times Tables 6-10',
            description:
              'Master the higher multiplication tables with practice games and challenges.',
            type: LessonType.GAME,
            contentPath: 'times-tables-6-10',
            duration: 20,
            xpReward: 75,
            requiredScore: 70,
          },
          {
            order: 4,
            title: 'Multiplication Strategies',
            description:
              'Learn helpful strategies and tricks for solving multiplication problems quickly.',
            type: LessonType.READING,
            contentPath: '/lessons/multiplication/strategies.html',
            duration: 15,
            xpReward: 50,
            requiredScore: null,
          },
          {
            order: 5,
            title: 'Word Problems: Level 1',
            description:
              'Apply multiplication skills to solve real-world word problems.',
            type: LessonType.QUIZ,
            contentPath: '/lessons/multiplication/word-problems-1.html',
            duration: 25,
            xpReward: 100,
            requiredScore: 75,
          },
          {
            order: 6,
            title: 'Multiplication Speed Challenge',
            description:
              'Test your speed and accuracy with timed multiplication challenges.',
            type: LessonType.GAME,
            contentPath: 'multiplication-speed-challenge',
            duration: 20,
            xpReward: 75,
            requiredScore: 80,
          },
          {
            order: 7,
            title: 'Final Assessment',
            description:
              'Complete the final assessment to show your multiplication mastery and earn your certificate!',
            type: LessonType.PROJECT,
            contentPath: '/lessons/multiplication/final-assessment.html',
            duration: 30,
            xpReward: 150,
            requiredScore: 85,
          },
        ],
      },
    },
  });

  console.log(`✅ Created: ${multiplicationCourse.title} with 7 lessons\n`);

  // Course 2: Fractions Foundations (Premium, Intermediate, Math)
  console.log('📗 Creating: Fractions Foundations');
  const fractionsCourse = await prisma.course.upsert({
    where: { slug: 'fractions-foundations' },
    update: {},
    create: {
      title: 'Fractions Foundations',
      slug: 'fractions-foundations',
      description:
        'Build a solid understanding of fractions through interactive lessons and games. Learn to identify, compare, add, and subtract fractions with confidence.',
      subject: 'math',
      gradeLevel: ['4-6'],
      difficulty: Difficulty.INTERMEDIATE,
      isPremium: true,
      isPublished: true,
      thumbnailUrl: '/images/courses/fractions.jpg',
      estimatedMinutes: 240,
      totalXP: 825,
      prerequisiteCourseIds: [multiplicationCourse.id],
      lessons: {
        create: [
          {
            order: 1,
            title: 'Introduction to Fractions',
            description:
              'Understand what fractions are and how they represent parts of a whole.',
            type: LessonType.VIDEO,
            contentPath: '/lessons/fractions/intro-video.html',
            duration: 12,
            xpReward: 50,
            requiredScore: null,
          },
          {
            order: 2,
            title: 'Identifying Fractions',
            description:
              'Practice recognizing and naming fractions in different visual representations.',
            type: LessonType.INTERACTIVE,
            contentPath: '/lessons/fractions/identifying.html',
            duration: 20,
            xpReward: 75,
            requiredScore: null,
          },
          {
            order: 3,
            title: 'Equivalent Fractions',
            description:
              'Learn how different fractions can represent the same value.',
            type: LessonType.GAME,
            contentPath: 'equivalent-fractions-game',
            duration: 25,
            xpReward: 100,
            requiredScore: 75,
          },
          {
            order: 4,
            title: 'Comparing Fractions',
            description:
              'Master comparing fractions using visual models and common denominators.',
            type: LessonType.INTERACTIVE,
            contentPath: '/lessons/fractions/comparing.html',
            duration: 20,
            xpReward: 75,
            requiredScore: 70,
          },
          {
            order: 5,
            title: 'Adding Fractions',
            description:
              'Learn to add fractions with like and unlike denominators.',
            type: LessonType.GAME,
            contentPath: 'fraction-addition-game',
            duration: 30,
            xpReward: 125,
            requiredScore: 80,
          },
          {
            order: 6,
            title: 'Subtracting Fractions',
            description:
              'Practice subtracting fractions through interactive exercises.',
            type: LessonType.GAME,
            contentPath: 'fraction-subtraction-game',
            duration: 30,
            xpReward: 125,
            requiredScore: 80,
          },
          {
            order: 7,
            title: 'Mixed Numbers',
            description:
              'Understand mixed numbers and how to convert between mixed numbers and improper fractions.',
            type: LessonType.INTERACTIVE,
            contentPath: '/lessons/fractions/mixed-numbers.html',
            duration: 25,
            xpReward: 100,
            requiredScore: 70,
          },
          {
            order: 8,
            title: 'Fractions in Real Life',
            description:
              'Apply fraction skills to solve real-world problems involving cooking, measurements, and more.',
            type: LessonType.QUIZ,
            contentPath: '/lessons/fractions/real-world.html',
            duration: 25,
            xpReward: 100,
            requiredScore: 75,
          },
          {
            order: 9,
            title: 'Final Project: Fraction Master',
            description:
              'Complete a comprehensive project to demonstrate your fraction mastery!',
            type: LessonType.PROJECT,
            contentPath: '/lessons/fractions/final-project.html',
            duration: 40,
            xpReward: 175,
            requiredScore: 85,
          },
        ],
      },
    },
  });

  console.log(`✅ Created: ${fractionsCourse.title} with 9 lessons\n`);

  // Course 3: Science Lab Basics (Free, Beginner, Science)
  console.log('📙 Creating: Science Lab Basics');
  const scienceCourse = await prisma.course.upsert({
    where: { slug: 'science-lab-basics' },
    update: {},
    create: {
      title: 'Science Lab Basics',
      slug: 'science-lab-basics',
      description:
        'Learn the fundamentals of scientific inquiry and lab safety. Explore the scientific method through virtual experiments and interactive simulations.',
      subject: 'science',
      gradeLevel: ['3-6'],
      difficulty: Difficulty.BEGINNER,
      isPremium: false,
      isPublished: true,
      thumbnailUrl: '/images/courses/science-lab.jpg',
      estimatedMinutes: 150,
      totalXP: 625,
      prerequisiteCourseIds: [],
      lessons: {
        create: [
          {
            order: 1,
            title: 'Welcome to the Science Lab',
            description:
              'Introduction to scientific thinking and the exciting world of discovery.',
            type: LessonType.VIDEO,
            contentPath: '/lessons/science/welcome.html',
            duration: 10,
            xpReward: 50,
            requiredScore: null,
          },
          {
            order: 2,
            title: 'Lab Safety Rules',
            description:
              'Learn essential safety procedures for conducting experiments safely.',
            type: LessonType.INTERACTIVE,
            contentPath: '/lessons/science/safety.html',
            duration: 15,
            xpReward: 75,
            requiredScore: 100, // Must get perfect score on safety!
          },
          {
            order: 3,
            title: 'The Scientific Method',
            description:
              'Understand the steps scientists use to investigate questions and solve problems.',
            type: LessonType.READING,
            contentPath: '/lessons/science/scientific-method.html',
            duration: 20,
            xpReward: 75,
            requiredScore: null,
          },
          {
            order: 4,
            title: 'Making Observations',
            description:
              'Practice using your senses to make detailed scientific observations.',
            type: LessonType.GAME,
            contentPath: 'observation-game',
            duration: 20,
            xpReward: 100,
            requiredScore: 70,
          },
          {
            order: 5,
            title: 'Asking Scientific Questions',
            description:
              'Learn how to ask testable questions that can be answered through experiments.',
            type: LessonType.INTERACTIVE,
            contentPath: '/lessons/science/asking-questions.html',
            duration: 15,
            xpReward: 75,
            requiredScore: null,
          },
          {
            order: 6,
            title: 'Virtual Experiment: Plant Growth',
            description:
              'Conduct a virtual experiment to investigate factors affecting plant growth.',
            type: LessonType.GAME,
            contentPath: 'plant-experiment',
            duration: 30,
            xpReward: 125,
            requiredScore: 75,
          },
          {
            order: 7,
            title: 'Analyzing Data',
            description:
              'Learn to organize and interpret data from experiments using charts and graphs.',
            type: LessonType.INTERACTIVE,
            contentPath: '/lessons/science/data-analysis.html',
            duration: 20,
            xpReward: 100,
            requiredScore: 70,
          },
          {
            order: 8,
            title: 'Final Project: Design Your Own Experiment',
            description:
              "Apply everything you've learned to design and conduct your own scientific investigation!",
            type: LessonType.PROJECT,
            contentPath: '/lessons/science/design-experiment.html',
            duration: 35,
            xpReward: 150,
            requiredScore: 80,
          },
        ],
      },
    },
  });

  console.log(`✅ Created: ${scienceCourse.title} with 8 lessons\n`);

  // Summary
  const courseCount = await prisma.course.count();
  const lessonCount = await prisma.courseLesson.count();

  console.log('✨ Course seeding complete!\n');
  console.log('📊 Course Summary:');
  console.log(`   - Total Courses: ${courseCount}`);
  console.log(`   - Total Lessons: ${lessonCount}`);
  console.log(
    `   - Free Courses: 2 (Multiplication Mastery, Science Lab Basics)`
  );
  console.log(`   - Premium Courses: 1 (Fractions Foundations)`);
  console.log(
    `   - Total XP Available: ${multiplicationCourse.totalXP + fractionsCourse.totalXP + scienceCourse.totalXP} XP\n`
  );

  console.log(
    '💡 Pro Tip: You can run "npm run db:reset" to clear and re-seed the database anytime.'
  );
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
