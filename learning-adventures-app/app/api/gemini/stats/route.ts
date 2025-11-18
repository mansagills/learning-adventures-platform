import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get total Gemini content
    const total = await prisma.geminiContent.count();

    // 3. Get this month's count
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonth = await prisma.geminiContent.count({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    // 4. Get published count
    const published = await prisma.geminiContent.count({
      where: {
        status: 'PUBLISHED'
      }
    });

    // 5. Get testing count
    const testing = await prisma.geminiContent.count({
      where: {
        status: 'TESTING'
      }
    });

    // 6. Get total cost this month
    const monthlyCostData = await prisma.geminiUsage.aggregate({
      where: {
        createdAt: {
          gte: startOfMonth
        },
        success: true
      },
      _sum: {
        estimatedCost: true,
        tokensInput: true,
        tokensOutput: true
      }
    });

    const monthlyCost = monthlyCostData._sum.estimatedCost || 0;
    const monthlyTokensInput = monthlyCostData._sum.tokensInput || 0;
    const monthlyTokensOutput = monthlyCostData._sum.tokensOutput || 0;

    // 7. Get stats by category
    const byCategory = await prisma.geminiContent.groupBy({
      by: ['category'],
      _count: {
        id: true
      }
    });

    // 8. Get stats by status
    const byStatus = await prisma.geminiContent.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // 9. Get recent generations (last 5)
    const recentGenerations = await prisma.geminiContent.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        gameType: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // 10. Get average cost per generation
    const avgCostData = await prisma.geminiUsage.aggregate({
      where: {
        operation: 'generate',
        success: true
      },
      _avg: {
        estimatedCost: true
      }
    });

    const avgCostPerGeneration = avgCostData._avg.estimatedCost || 0;

    // 11. Return comprehensive stats
    return NextResponse.json({
      total,
      thisMonth,
      published,
      testing,
      monthlyCost: Number(monthlyCost.toFixed(2)),
      monthlyTokens: {
        input: monthlyTokensInput,
        output: monthlyTokensOutput,
        total: monthlyTokensInput + monthlyTokensOutput
      },
      avgCostPerGeneration: Number(avgCostPerGeneration.toFixed(4)),
      byCategory: byCategory.map(item => ({
        category: item.category,
        count: item._count.id
      })),
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count.id
      })),
      recentGenerations
    });

  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats', details: error.message },
      { status: 500 }
    );
  }
}
