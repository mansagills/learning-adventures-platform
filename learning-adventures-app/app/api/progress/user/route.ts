import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/progress/user
 * Get all progress for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        progress: {
          orderBy: {
            lastAccessed: 'desc',
          },
        },
        achievements: {
          orderBy: {
            earnedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate statistics
    const stats = calculateUserStats(user.progress);

    return NextResponse.json({
      progress: user.progress,
      achievements: user.achievements,
      stats,
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user progress' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Calculate user statistics from progress data
 */
function calculateUserStats(progress: any[]) {
  const stats = {
    totalAdventures: progress.length,
    completed: 0,
    inProgress: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    byCategory: {} as Record<string, {
      total: number;
      completed: number;
      averageScore: number;
    }>,
    recentActivity: [] as any[],
  };

  let totalScores = 0;
  let scoreCount = 0;

  progress.forEach((p) => {
    // Count by status
    if (p.status === 'COMPLETED' || p.status === 'MASTERED') {
      stats.completed++;
    } else if (p.status === 'IN_PROGRESS') {
      stats.inProgress++;
    }

    // Total time
    stats.totalTimeSpent += p.timeSpent || 0;

    // Scores
    if (p.score !== null) {
      totalScores += p.score;
      scoreCount++;
    }

    // Category breakdown
    if (!stats.byCategory[p.category]) {
      stats.byCategory[p.category] = {
        total: 0,
        completed: 0,
        averageScore: 0,
      };
    }

    stats.byCategory[p.category].total++;
    if (p.status === 'COMPLETED' || p.status === 'MASTERED') {
      stats.byCategory[p.category].completed++;
    }
  });

  // Calculate average score
  if (scoreCount > 0) {
    stats.averageScore = Math.round(totalScores / scoreCount);
  }

  // Calculate category averages
  Object.keys(stats.byCategory).forEach((category) => {
    const categoryProgress = progress.filter(p => p.category === category && p.score !== null);
    if (categoryProgress.length > 0) {
      const categoryTotal = categoryProgress.reduce((sum, p) => sum + (p.score || 0), 0);
      stats.byCategory[category].averageScore = Math.round(categoryTotal / categoryProgress.length);
    }
  });

  // Recent activity (last 10 completed)
  stats.recentActivity = progress
    .filter(p => p.completedAt)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 10);

  return stats;
}
