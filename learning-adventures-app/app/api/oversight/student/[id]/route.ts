import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/oversight/student/[id] - Get detailed student progress
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!currentUser || (currentUser.role !== 'TEACHER' && currentUser.role !== 'PARENT' && currentUser.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only teachers, parents, and admins can view student details' },
        { status: 403 }
      );
    }

    const studentId = params.id;

    // Get student info
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        email: true,
        gradeLevel: true,
        subjects: true,
        createdAt: true,
        role: true
      }
    });

    if (!student || student.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Get all progress data
    const [progress, achievements, goals, level, recentActivity] = await Promise.all([
      prisma.userProgress.findMany({
        where: { userId: studentId },
        orderBy: { lastAccessed: 'desc' }
      }),
      prisma.userAchievement.findMany({
        where: { userId: studentId },
        orderBy: { earnedAt: 'desc' }
      }),
      prisma.learningGoal.findMany({
        where: { userId: studentId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.userLevel.findUnique({
        where: { userId: studentId }
      }),
      prisma.userProgress.findMany({
        where: { userId: studentId },
        orderBy: { lastAccessed: 'desc' },
        take: 10
      })
    ]);

    // Calculate stats by category
    const statsByCategory = progress.reduce((acc, p) => {
      if (!acc[p.category]) {
        acc[p.category] = { total: 0, completed: 0, totalScore: 0, totalTime: 0 };
      }
      acc[p.category].total++;
      if (p.status === 'COMPLETED') {
        acc[p.category].completed++;
        acc[p.category].totalScore += p.score || 0;
        acc[p.category].totalTime += p.timeSpent || 0;
      }
      return acc;
    }, {} as Record<string, any>);

    // Calculate overall stats
    const totalAdventures = progress.length;
    const completedAdventures = progress.filter(p => p.status === 'COMPLETED').length;
    const inProgressAdventures = progress.filter(p => p.status === 'IN_PROGRESS').length;
    const totalTimeSpent = progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0);
    const averageScore = completedAdventures > 0
      ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / completedAdventures)
      : 0;

    const completionRate = totalAdventures > 0
      ? Math.round((completedAdventures / totalAdventures) * 100)
      : 0;

    return NextResponse.json({
      student,
      stats: {
        totalAdventures,
        completedAdventures,
        inProgressAdventures,
        completionRate,
        averageScore,
        totalTimeSpent,
        achievements: achievements.length,
        activeGoals: goals.filter(g => g.status === 'ACTIVE').length,
        completedGoals: goals.filter(g => g.status === 'COMPLETED').length,
        currentLevel: level?.currentLevel || 1,
        totalXP: level?.totalXP || 0,
        currentStreak: level?.currentStreak || 0,
        byCategory: statsByCategory
      },
      progress,
      achievements,
      goals,
      level,
      recentActivity
    });

  } catch (error) {
    console.error('Error fetching student details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student details' },
      { status: 500 }
    );
  }
}
