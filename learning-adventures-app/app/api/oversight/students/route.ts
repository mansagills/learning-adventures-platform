import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/oversight/students - Get students for teacher/parent
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || (user.role !== 'TEACHER' && user.role !== 'PARENT' && user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Only teachers, parents, and admins can view student data' },
        { status: 403 }
      );
    }

    let students: any[] = [];

    if (user.role === 'TEACHER' || user.role === 'ADMIN') {
      // Get students from teacher's classrooms
      const classrooms = await prisma.classroom.findMany({
        where: user.role === 'TEACHER' ? { teacherId: session.user.id } : {},
        include: {
          enrollments: {
            where: { isActive: true },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  gradeLevel: true,
                  createdAt: true
                }
              }
            }
          }
        }
      });

      students = classrooms.flatMap(classroom =>
        classroom.enrollments.map(enrollment => ({
          ...enrollment.user,
          classroomId: classroom.id,
          classroomName: classroom.name,
          enrolledAt: enrollment.enrolledAt
        }))
      );
    } else if (user.role === 'PARENT') {
      // TODO: Implement parent-child relationships
      // For now, return empty array
      students = [];
    }

    // Get progress stats for each student
    const studentsWithStats = await Promise.all(
      students.map(async (student) => {
        const [progressCount, completedCount, achievements, goals] = await Promise.all([
          prisma.userProgress.count({
            where: { userId: student.id }
          }),
          prisma.userProgress.count({
            where: { userId: student.id, status: 'COMPLETED' }
          }),
          prisma.userAchievement.count({
            where: { userId: student.id }
          }),
          prisma.learningGoal.count({
            where: { userId: student.id, status: 'ACTIVE' }
          })
        ]);

        const completionRate = progressCount > 0
          ? Math.round((completedCount / progressCount) * 100)
          : 0;

        return {
          ...student,
          stats: {
            totalAdventures: progressCount,
            completedAdventures: completedCount,
            completionRate,
            achievements,
            activeGoals: goals
          }
        };
      })
    );

    return NextResponse.json({
      students: studentsWithStats,
      count: studentsWithStats.length
    });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
