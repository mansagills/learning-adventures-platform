/**
 * Quiz Helper Functions
 * Handles quiz validation, hints, and XP-based answer reveals
 */

import { prisma } from '@/lib/prisma';

/**
 * Quiz question interface
 */
export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string | number; // Index for multiple choice, or value for others
  explanation: string; // Shown after answering
  hints: string[]; // Progressive hints for wrong answers
  points: number; // Points for this question
}

/**
 * Complete quiz data structure
 */
export interface QuizData {
  questions: QuizQuestion[];
  passingScore: number; // Percentage (0-100)
  allowRetry: boolean;
  maxAttempts?: number; // Optional limit on attempts
}

/**
 * Quiz submission result
 */
export interface QuizResult {
  score: number; // Percentage
  passed: boolean;
  results: QuestionResult[];
  totalPoints: number;
  earnedPoints: number;
}

/**
 * Individual question result
 */
export interface QuizResult {
  score: number; // Percentage
  passed: boolean;
  results: QuestionResult[];
  totalPoints: number;
  earnedPoints: number;
}

/**
 * Individual question result
 */
export interface QuestionResult {
  questionId: string;
  correct: boolean;
  userAnswer: string | number;
  correctAnswer: string | number;
  explanation: string;
  nextHint: string | null; // Hint for next attempt
  pointsEarned: number;
}

/**
 * Validate quiz answers and return results with hints
 */
export async function validateQuizAnswers(
  quizData: QuizData,
  userAnswers: Record<string, any>,
  attemptNumber: number = 0
): Promise<QuizResult> {
  const results: QuestionResult[] = quizData.questions.map((q) => {
    const userAnswer = userAnswers[q.id];
    const isCorrect = checkAnswer(q, userAnswer);

    return {
      questionId: q.id,
      correct: isCorrect,
      userAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      nextHint: isCorrect ? null : getNextHint(q, attemptNumber),
      pointsEarned: isCorrect ? q.points : 0,
    };
  });

  const totalPoints = quizData.questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = results.reduce((sum, r) => sum + r.pointsEarned, 0);
  const score = (earnedPoints / totalPoints) * 100;
  const passed = score >= quizData.passingScore;

  return {
    score,
    passed,
    results,
    totalPoints,
    earnedPoints,
  };
}

/**
 * Check if an answer is correct
 */
function checkAnswer(question: QuizQuestion, userAnswer: any): boolean {
  if (question.type === 'multiple-choice') {
    // For multiple choice, compare index
    return userAnswer === question.correctAnswer;
  } else if (question.type === 'true-false') {
    // For true/false, compare string/boolean
    const normalizedUser = String(userAnswer).toLowerCase();
    const normalizedCorrect = String(question.correctAnswer).toLowerCase();
    return normalizedUser === normalizedCorrect;
  } else if (question.type === 'fill-blank') {
    // For fill-in-blank, case-insensitive string comparison
    const normalizedUser = String(userAnswer).toLowerCase().trim();
    const normalizedCorrect = String(question.correctAnswer).toLowerCase().trim();
    return normalizedUser === normalizedCorrect;
  }

  return false;
}

/**
 * Get the next hint for a question
 */
function getNextHint(question: QuizQuestion, attemptNumber: number): string | null {
  if (!question.hints || question.hints.length === 0) {
    return null;
  }

  // Return hint for current attempt, or last hint if past the end
  const hintIndex = Math.min(attemptNumber, question.hints.length - 1);
  return question.hints[hintIndex];
}

/**
 * Reveal answer by spending XP
 */
export async function revealAnswerWithXP(
  userId: string,
  xpCost: number = 10
): Promise<{
  success: boolean;
  reason?: string;
  xpRemaining?: number;
}> {
  // Get user's current XP
  const userLevel = await prisma.userLevel.findUnique({
    where: { userId },
    select: { totalXP: true },
  });

  if (!userLevel) {
    return {
      success: false,
      reason: 'User level data not found',
    };
  }

  if (userLevel.totalXP < xpCost) {
    return {
      success: false,
      reason: `Insufficient XP. You need ${xpCost} XP but only have ${userLevel.totalXP} XP`,
    };
  }

  // Deduct XP
  const updated = await prisma.userLevel.update({
    where: { userId },
    data: {
      totalXP: { decrement: xpCost },
    },
    select: { totalXP: true },
  });

  return {
    success: true,
    xpRemaining: updated.totalXP,
  };
}

/**
 * Calculate XP cost for revealing an answer
 * Can be based on question difficulty or user level
 */
export function calculateRevealCost(
  questionPoints: number,
  userLevel: number = 1
): number {
  // Base cost is 10 XP, but can scale with question difficulty
  const baseCost = 10;
  const difficultyCost = Math.floor(questionPoints / 2);

  return Math.max(baseCost, difficultyCost);
}

/**
 * Get hint for a specific question
 */
export function getHintForQuestion(
  quizData: QuizData,
  questionId: string,
  attemptNumber: number
): string | null {
  const question = quizData.questions.find((q) => q.id === questionId);

  if (!question) {
    return null;
  }

  return getNextHint(question, attemptNumber);
}

/**
 * Check if quiz allows retries
 */
export function canRetryQuiz(quizData: QuizData, currentAttempts: number): boolean {
  if (!quizData.allowRetry) {
    return false;
  }

  if (quizData.maxAttempts && currentAttempts >= quizData.maxAttempts) {
    return false;
  }

  return true;
}

/**
 * Validate quiz data structure
 */
export function validateQuizStructure(quizData: any): quizData is QuizData {
  if (!quizData || typeof quizData !== 'object') {
    return false;
  }

  if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
    return false;
  }

  if (typeof quizData.passingScore !== 'number' || quizData.passingScore < 0 || quizData.passingScore > 100) {
    return false;
  }

  // Validate each question
  for (const question of quizData.questions) {
    if (!question.id || !question.type || !question.question) {
      return false;
    }

    if (question.type === 'multiple-choice' && !Array.isArray(question.options)) {
      return false;
    }

    if (!question.explanation || !Array.isArray(question.hints)) {
      return false;
    }

    if (typeof question.points !== 'number' || question.points <= 0) {
      return false;
    }
  }

  return true;
}
