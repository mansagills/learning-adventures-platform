/**
 * XP Calculation and Streak Logic
 *
 * Functions for calculating experience points, streak bonuses,
 * and level progression.
 */

import { PrismaClient } from '@/lib/generated/prisma';
import type {
  XPCalculation,
  StreakMultiplier,
  LevelInfo,
  DailyXPBreakdown,
} from './types';

const prisma = new PrismaClient();

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Streak multipliers based on consecutive days
 */
export const STREAK_MULTIPLIERS: StreakMultiplier[] = [
  { days: 1, multiplier: 1.0, bonusPercentage: 0 }, // Day 1-2: No bonus
  { days: 3, multiplier: 1.2, bonusPercentage: 20 }, // Day 3-6: +20%
  { days: 7, multiplier: 1.5, bonusPercentage: 50 }, // Day 7-29: +50%
  { days: 30, multiplier: 2.0, bonusPercentage: 100 }, // Day 30+: +100% (double!)
];

/**
 * Base XP multiplier for leveling formula
 * Formula: xpRequired = BASE_XP_MULTIPLIER * (level ^ LEVEL_EXPONENT)
 */
export const BASE_XP_MULTIPLIER = 100;

/**
 * Exponent for level scaling (makes leveling progressively harder)
 */
export const LEVEL_EXPONENT = 1.5;

// ============================================================================
// STREAK CALCULATIONS
// ============================================================================

/**
 * Get streak multiplier based on consecutive days
 */
export function getStreakMultiplier(streakDays: number): StreakMultiplier {
  // Find the highest applicable multiplier
  for (let i = STREAK_MULTIPLIERS.length - 1; i >= 0; i--) {
    if (streakDays >= STREAK_MULTIPLIERS[i].days) {
      return STREAK_MULTIPLIERS[i];
    }
  }

  // Default to no multiplier
  return STREAK_MULTIPLIERS[0];
}

/**
 * Calculate XP with streak bonus
 */
export function calculateXPWithStreak(
  baseXP: number,
  streakDays: number,
  source: 'lesson' | 'game' | 'quiz' | 'project' = 'lesson'
): XPCalculation {
  const streakInfo = getStreakMultiplier(streakDays);
  const totalXP = Math.floor(baseXP * streakInfo.multiplier);
  const streakBonusXP = totalXP - baseXP;

  return {
    baseXP,
    streakMultiplier: streakInfo.multiplier,
    streakBonusXP,
    totalXP,
    source,
  };
}

/**
 * Get user's current streak
 */
export async function getUserStreak(userId: string): Promise<number> {
  const userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  return userLevel?.currentStreak || 0;
}

/**
 * Update user's streak
 * Call this daily when user earns XP
 */
export async function updateUserStreak(userId: string): Promise<{
  streakContinued: boolean;
  currentStreak: number;
  streakBroken: boolean;
}> {
  const userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  if (!userLevel) {
    // Create user level if doesn't exist
    await prisma.userLevel.create({
      data: {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: new Date(),
      },
    });

    return {
      streakContinued: true,
      currentStreak: 1,
      streakBroken: false,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastActivity = userLevel.lastActivityDate
    ? new Date(userLevel.lastActivityDate)
    : null;

  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
  }

  // Check if already logged activity today
  if (lastActivity && lastActivity.getTime() === today.getTime()) {
    return {
      streakContinued: true,
      currentStreak: userLevel.currentStreak,
      streakBroken: false,
    };
  }

  // Check if streak continues (yesterday)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let newStreak = 1;
  let streakBroken = false;
  let streakContinued = false;

  if (lastActivity && lastActivity.getTime() === yesterday.getTime()) {
    // Streak continues!
    newStreak = userLevel.currentStreak + 1;
    streakContinued = true;
  } else if (lastActivity) {
    // Streak broken
    streakBroken = true;
  }

  // Update longest streak if needed
  const longestStreak = Math.max(userLevel.longestStreak, newStreak);

  await prisma.userLevel.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak,
      lastActivityDate: today,
    },
  });

  return {
    streakContinued,
    currentStreak: newStreak,
    streakBroken,
  };
}

// ============================================================================
// LEVEL CALCULATIONS
// ============================================================================

/**
 * Calculate XP required to reach a specific level
 */
export function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(BASE_XP_MULTIPLIER * Math.pow(level, LEVEL_EXPONENT));
}

/**
 * Calculate total XP needed from level 1 to reach target level
 */
export function getTotalXPForLevel(targetLevel: number): number {
  let totalXP = 0;
  for (let level = 2; level <= targetLevel; level++) {
    totalXP += getXPRequiredForLevel(level);
  }
  return totalXP;
}

/**
 * Get level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
  let level = 1;
  let xpSoFar = 0;

  while (true) {
    const xpForNextLevel = getXPRequiredForLevel(level + 1);
    if (xpSoFar + xpForNextLevel > totalXP) {
      break;
    }
    xpSoFar += xpForNextLevel;
    level++;
  }

  return level;
}

/**
 * Get detailed level information for a user
 */
export function getLevelInfo(totalXP: number): LevelInfo {
  const currentLevel = getLevelFromXP(totalXP);
  const xpForCurrentLevelStart = getTotalXPForLevel(currentLevel);
  const xpRequiredForNextLevel = getXPRequiredForLevel(currentLevel + 1);
  const xpForCurrentLevel = totalXP - xpForCurrentLevelStart;
  const progressToNextLevel =
    xpRequiredForNextLevel > 0
      ? Math.min(100, Math.round((xpForCurrentLevel / xpRequiredForNextLevel) * 100))
      : 100;

  return {
    currentLevel,
    totalXP,
    xpForCurrentLevel,
    xpRequiredForNextLevel,
    progressToNextLevel,
  };
}

/**
 * Get user's level information from database
 */
export async function getUserLevelInfo(userId: string): Promise<LevelInfo> {
  const userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  const totalXP = userLevel?.totalXP || 0;
  return getLevelInfo(totalXP);
}

/**
 * Award XP to user and update level
 */
export async function awardXP(
  userId: string,
  xpAmount: number,
  source: 'lesson' | 'game' | 'quiz' | 'project' = 'lesson'
): Promise<{
  xpAwarded: number;
  newTotalXP: number;
  leveledUp: boolean;
  oldLevel: number;
  newLevel: number;
}> {
  // Get or create user level
  let userLevel = await prisma.userLevel.findUnique({
    where: { userId },
  });

  if (!userLevel) {
    userLevel = await prisma.userLevel.create({
      data: {
        userId,
        totalXP: 0,
        currentLevel: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
    });
  }

  const oldLevel = getLevelFromXP(userLevel.totalXP);
  const newTotalXP = userLevel.totalXP + xpAmount;
  const newLevel = getLevelFromXP(newTotalXP);
  const leveledUp = newLevel > oldLevel;

  // Update user level
  await prisma.userLevel.update({
    where: { userId },
    data: {
      totalXP: newTotalXP,
      currentLevel: newLevel,
    },
  });

  return {
    xpAwarded: xpAmount,
    newTotalXP,
    leveledUp,
    oldLevel,
    newLevel,
  };
}

// ============================================================================
// DAILY XP TRACKING
// ============================================================================

/**
 * Record daily XP for a user
 */
export async function recordDailyXP(
  userId: string,
  xpAmount: number,
  source: 'lesson' | 'game'
): Promise<void> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get current streak for bonus calculation
  const streak = await getUserStreak(userId);
  const streakInfo = getStreakMultiplier(streak);
  const streakBonus = Math.floor(xpAmount * (streakInfo.multiplier - 1));

  // Upsert daily XP record
  await prisma.dailyXP.upsert({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    create: {
      userId,
      date: today,
      xpFromLessons: source === 'lesson' ? xpAmount : 0,
      xpFromGames: source === 'game' ? xpAmount : 0,
      xpFromStreak: streakBonus,
      totalXP: xpAmount + streakBonus,
    },
    update: {
      xpFromLessons: {
        increment: source === 'lesson' ? xpAmount : 0,
      },
      xpFromGames: {
        increment: source === 'game' ? xpAmount : 0,
      },
      xpFromStreak: {
        increment: streakBonus,
      },
      totalXP: {
        increment: xpAmount + streakBonus,
      },
    },
  });
}

/**
 * Get daily XP for a specific date
 */
export async function getDailyXP(
  userId: string,
  date: Date = new Date()
): Promise<DailyXPBreakdown | null> {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const dailyXP = await prisma.dailyXP.findUnique({
    where: {
      userId_date: {
        userId,
        date: targetDate,
      },
    },
  });

  if (!dailyXP) return null;

  const percentFromLessons =
    dailyXP.totalXP > 0
      ? Math.round((dailyXP.xpFromLessons / dailyXP.totalXP) * 100)
      : 0;
  const percentFromGames =
    dailyXP.totalXP > 0
      ? Math.round((dailyXP.xpFromGames / dailyXP.totalXP) * 100)
      : 0;
  const percentFromStreak =
    dailyXP.totalXP > 0
      ? Math.round((dailyXP.xpFromStreak / dailyXP.totalXP) * 100)
      : 0;

  return {
    ...dailyXP,
    percentFromLessons,
    percentFromGames,
    percentFromStreak,
  };
}

/**
 * Get XP history for date range
 */
export async function getXPHistory(
  userId: string,
  startDate: Date,
  endDate: Date = new Date()
): Promise<DailyXPBreakdown[]> {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const history = await prisma.dailyXP.findMany({
    where: {
      userId,
      date: {
        gte: start,
        lte: end,
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  return history.map((dailyXP) => ({
    ...dailyXP,
    percentFromLessons:
      dailyXP.totalXP > 0
        ? Math.round((dailyXP.xpFromLessons / dailyXP.totalXP) * 100)
        : 0,
    percentFromGames:
      dailyXP.totalXP > 0
        ? Math.round((dailyXP.xpFromGames / dailyXP.totalXP) * 100)
        : 0,
    percentFromStreak:
      dailyXP.totalXP > 0
        ? Math.round((dailyXP.xpFromStreak / dailyXP.totalXP) * 100)
        : 0,
  }));
}

/**
 * Get total XP earned in last N days
 */
export async function getRecentXP(userId: string, days: number = 7): Promise<number> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const result = await prisma.dailyXP.aggregate({
    where: {
      userId,
      date: {
        gte: startDate,
      },
    },
    _sum: {
      totalXP: true,
    },
  });

  return result._sum.totalXP || 0;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format XP number with commas
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString();
}

/**
 * Get XP color based on amount (for UI)
 */
export function getXPColor(xp: number): string {
  if (xp >= 150) return '#FFD700'; // Gold for high XP
  if (xp >= 100) return '#C0C0C0'; // Silver for medium XP
  if (xp >= 50) return '#CD7F32'; // Bronze for low XP
  return '#8B8B8B'; // Gray for minimal XP
}

/**
 * Get level badge icon (for UI)
 */
export function getLevelBadge(level: number): string {
  if (level >= 50) return '👑'; // King
  if (level >= 40) return '🏆'; // Trophy
  if (level >= 30) return '💎'; // Diamond
  if (level >= 20) return '⭐'; // Star
  if (level >= 10) return '🌟'; // Glowing star
  return '🎓'; // Graduate
}

/**
 * Cleanup function
 */
export async function disconnectPrisma() {
  await prisma.$disconnect();
}
