export const dynamic = 'force-dynamic';
import { getApiUser } from '@/lib/api-auth';
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/achievements/user
 * Get all achievements for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const { apiUser, error: authError } = await getApiUser();

    if (authError || !apiUser) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: apiUser.email },
      include: {
        achievements: {
          orderBy: {
            earnedAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Group achievements by type
    const grouped = {
      completion: user.achievements.filter((a) => a.type === 'completion'),
      streak: user.achievements.filter((a) => a.type === 'streak'),
      score: user.achievements.filter((a) => a.type === 'score'),
      time: user.achievements.filter((a) => a.type === 'time'),
    };

    // Group by category
    const byCategory: Record<string, any[]> = {};
    user.achievements.forEach((achievement) => {
      if (achievement.category) {
        if (!byCategory[achievement.category]) {
          byCategory[achievement.category] = [];
        }
        byCategory[achievement.category].push(achievement);
      }
    });

    return NextResponse.json({
      achievements: user.achievements,
      grouped,
      byCategory,
      totalCount: user.achievements.length,
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
