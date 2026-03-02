/**
 * GET /api/level/status
 *
 * Get user's level, XP, streak, and daily XP data
 */

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { successResponse, handleApiError } from '@/lib/responses';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    // Get or create user level
    let userLevel = await prisma.userLevel.findUnique({
      where: { userId: user.id },
    });

    if (!userLevel) {
      // Create initial level record
      userLevel = await prisma.userLevel.create({
        data: {
          userId: user.id,
          currentLevel: 1,
          totalXP: 0,
          xpToNextLevel: 100,
          currentStreak: 0,
          longestStreak: 0,
        },
      });
    }

    // Calculate XP in current level
    const xpInCurrentLevel = calculateXPInCurrentLevel(
      userLevel.totalXP,
      userLevel.currentLevel
    );

    // Get today's daily XP
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyXP = await prisma.dailyXP.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    if (!dailyXP) {
      // Create today's record
      dailyXP = await prisma.dailyXP.create({
        data: {
          userId: user.id,
          date: today,
          xpFromLessons: 0,
          xpFromGames: 0,
          xpFromStreak: 0,
          totalXP: 0,
          lessonsCompleted: 0,
          gamesCompleted: 0,
        },
      });
    }

    return successResponse({
      level: {
        ...userLevel,
        xpInCurrentLevel,
      },
      dailyXP,
      streak: userLevel.currentStreak,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * Calculate how much XP the user has earned in their current level
 */
function calculateXPInCurrentLevel(
  totalXP: number,
  currentLevel: number
): number {
  let xpRemaining = totalXP;
  let level = 1;

  while (level < currentLevel) {
    const xpForLevel = Math.floor(100 * Math.pow(level, 1.5));
    xpRemaining -= xpForLevel;
    level++;
  }

  return Math.max(0, xpRemaining);
}
