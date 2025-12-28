import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { startOfWeek, startOfMonth, subWeeks, subMonths } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all-time'; // 'weekly', 'monthly', 'all-time'
    const category = searchParams.get('category'); // Optional subject filter
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type') || 'xp'; // 'xp', 'adventures', 'score'

    // Calculate date range for period filtering
    let startDate: Date | undefined;
    if (period === 'weekly') {
      startDate = startOfWeek(new Date(), { weekStartsOn: 1 });
    } else if (period === 'monthly') {
      startDate = startOfMonth(new Date());
    }

    // Build leaderboard based on type
    let leaderboard: any[] = [];

    if (type === 'xp') {
      // XP-based leaderboard
      const users = await prisma.user.findMany({
        where: {
          role: 'STUDENT'
        },
        include: {
          level: true,
          dailyXP: startDate ? {
            where: {
              date: {
                gte: startDate
              }
            }
          } : undefined
        },
        take: limit
      });

      leaderboard = users
        .map(user => {
          const totalXP = startDate
            ? user.dailyXP.reduce((sum, day) => sum + day.totalXP, 0)
            : user.level?.totalXP || 0;

          return {
            userId: user.id,
            name: user.name,
            image: user.image,
            gradeLevel: user.gradeLevel,
            totalXP,
            currentLevel: user.level?.currentLevel || 1,
            currentStreak: user.level?.currentStreak || 0
          };
        })
        .filter(user => user.totalXP > 0)
        .sort((a, b) => b.totalXP - a.totalXP)
        .slice(0, limit);

    } else if (type === 'adventures') {
      // Adventures completed leaderboard
      const whereClause: any = {
        status: 'COMPLETED'
      };

      if (startDate) {
        whereClause.completedAt = { gte: startDate };
      }

      if (category) {
        whereClause.category = category;
      }

      const progress = await prisma.userProgress.groupBy({
        by: ['userId'],
        where: whereClause,
        _count: {
          id: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: limit
      });

      const userIds = progress.map(p => p.userId);
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds }
        },
        include: {
          level: true
        }
      });

      const userMap = new Map(users.map(u => [u.id, u]));

      leaderboard = progress.map((p, index) => {
        const user = userMap.get(p.userId);
        return {
          userId: p.userId,
          name: user?.name,
          image: user?.image,
          gradeLevel: user?.gradeLevel,
          adventuresCompleted: p._count.id,
          currentLevel: user?.level?.currentLevel || 1,
          currentStreak: user?.level?.currentStreak || 0
        };
      });

    } else if (type === 'score') {
      // Average score leaderboard
      const whereClause: any = {
        status: 'COMPLETED',
        score: { not: null }
      };

      if (startDate) {
        whereClause.completedAt = { gte: startDate };
      }

      if (category) {
        whereClause.category = category;
      }

      const progress = await prisma.userProgress.groupBy({
        by: ['userId'],
        where: whereClause,
        _avg: {
          score: true
        },
        _count: {
          id: true
        },
        having: {
          id: {
            _count: {
              gte: 3 // Minimum 3 completed adventures to qualify
            }
          }
        },
        orderBy: {
          _avg: {
            score: 'desc'
          }
        },
        take: limit
      });

      const userIds = progress.map(p => p.userId);
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds }
        },
        include: {
          level: true
        }
      });

      const userMap = new Map(users.map(u => [u.id, u]));

      leaderboard = progress.map(p => {
        const user = userMap.get(p.userId);
        return {
          userId: p.userId,
          name: user?.name,
          image: user?.image,
          gradeLevel: user?.gradeLevel,
          averageScore: Math.round(p._avg.score || 0),
          adventuresCompleted: p._count.id,
          currentLevel: user?.level?.currentLevel || 1,
          currentStreak: user?.level?.currentStreak || 0
        };
      });
    }

    // Add rank to each entry
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

    // Find current user's position
    const currentUserRank = rankedLeaderboard.findIndex(
      entry => entry.userId === session.user.id
    );

    return NextResponse.json({
      leaderboard: rankedLeaderboard,
      currentUserRank: currentUserRank === -1 ? null : currentUserRank + 1,
      period,
      category: category || 'all',
      type,
      total: rankedLeaderboard.length
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
