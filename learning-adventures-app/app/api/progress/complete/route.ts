import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

/**
 * POST /api/progress/complete
 * Mark an adventure as completed
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { adventureId, score, timeSpent } = body;

    if (!adventureId) {
      return NextResponse.json(
        { error: 'Missing required field: adventureId' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update progress to completed
    const progress = await prisma.userProgress.update({
      where: {
        userId_adventureId: {
          userId: user.id,
          adventureId,
        },
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        score: score !== undefined ? score : undefined,
        timeSpent: timeSpent !== undefined ? timeSpent : undefined,
        lastAccessed: new Date(),
      },
    });

    // Check for new achievements
    const newAchievements = await checkAndAwardAchievements(user.id, progress);

    return NextResponse.json({
      progress,
      newAchievements,
    });
  } catch (error: any) {
    console.error('Error completing adventure:', error);

    if (error?.code === 'P2025') {
      return NextResponse.json(
        { error: 'Progress not found. Please start the adventure first.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to complete adventure' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check and award achievements based on progress
 */
async function checkAndAwardAchievements(userId: string, latestProgress: any) {
  const newAchievements = [];

  try {
    // Get all user progress
    const allProgress = await prisma.userProgress.findMany({
      where: { userId, status: 'COMPLETED' },
    });

    const completedCount = allProgress.length;
    const categoryProgress = allProgress.filter(p => p.category === latestProgress.category);

    // Achievement: First Adventure
    if (completedCount === 1) {
      const exists = await prisma.userAchievement.findFirst({
        where: { userId, title: 'First Adventure' },
      });

      if (!exists) {
        const achievement = await prisma.userAchievement.create({
          data: {
            userId,
            type: 'completion',
            title: 'First Adventure',
            description: 'Completed your first adventure!',
            category: null,
          },
        });
        newAchievements.push(achievement);
      }
    }

    // Achievement: Category Explorer (first in a category)
    if (categoryProgress.length === 1) {
      const categoryName = latestProgress.category.charAt(0).toUpperCase() + latestProgress.category.slice(1);
      const exists = await prisma.userAchievement.findFirst({
        where: { userId, title: `${categoryName} Explorer` },
      });

      if (!exists) {
        const achievement = await prisma.userAchievement.create({
          data: {
            userId,
            type: 'completion',
            title: `${categoryName} Explorer`,
            description: `Completed your first ${categoryName} adventure!`,
            category: latestProgress.category,
          },
        });
        newAchievements.push(achievement);
      }
    }

    // Achievement: Category Master (5 in a category)
    if (categoryProgress.length === 5) {
      const categoryName = latestProgress.category.charAt(0).toUpperCase() + latestProgress.category.slice(1);
      const exists = await prisma.userAchievement.findFirst({
        where: { userId, title: `${categoryName} Master` },
      });

      if (!exists) {
        const achievement = await prisma.userAchievement.create({
          data: {
            userId,
            type: 'completion',
            title: `${categoryName} Master`,
            description: `Completed 5 ${categoryName} adventures!`,
            category: latestProgress.category,
          },
        });
        newAchievements.push(achievement);
      }
    }

    // Achievement: Perfect Score
    if (latestProgress.score === 100) {
      const achievement = await prisma.userAchievement.create({
        data: {
          userId,
          type: 'score',
          title: 'Perfect Score',
          description: 'Achieved a perfect 100% score!',
          category: latestProgress.category,
        },
      });
      newAchievements.push(achievement);
    }

    // Achievement: Milestone achievements (10, 25, 50 completions)
    const milestones = [
      { count: 10, title: 'Rising Star', description: 'Completed 10 adventures!' },
      { count: 25, title: 'Learning Champion', description: 'Completed 25 adventures!' },
      { count: 50, title: 'Master Learner', description: 'Completed 50 adventures!' },
    ];

    for (const milestone of milestones) {
      if (completedCount === milestone.count) {
        const exists = await prisma.userAchievement.findFirst({
          where: { userId, title: milestone.title },
        });

        if (!exists) {
          const achievement = await prisma.userAchievement.create({
            data: {
              userId,
              type: 'completion',
              title: milestone.title,
              description: milestone.description,
              category: null,
            },
          });
          newAchievements.push(achievement);
        }
      }
    }

  } catch (error) {
    console.error('Error checking achievements:', error);
    // Don't fail the completion if achievement check fails
  }

  return newAchievements;
}
