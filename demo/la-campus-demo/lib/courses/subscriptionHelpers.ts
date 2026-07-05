/**
 * Subscription Helper Functions
 * Handles premium access validation and subscription management
 */

import { prisma } from '@/lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '@prisma/client';

/**
 * Check if a user has an active premium subscription
 */
export async function hasActivePremiumSubscription(
  userId: string
): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return subscription?.status === 'ACTIVE' && subscription?.tier === 'PREMIUM';
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(userId: string) {
  return await prisma.subscription.findUnique({
    where: { userId },
    select: {
      tier: true,
      status: true,
      startDate: true,
      endDate: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });
}

/**
 * Get subscription tier for a user
 */
export async function getUserSubscriptionTier(
  userId: string
): Promise<SubscriptionTier> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { tier: true },
  });

  return subscription?.tier || 'FREE';
}

/**
 * Check if subscription is active (regardless of tier)
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { status: true },
  });

  return subscription?.status === 'ACTIVE';
}

/**
 * Create a new subscription for a user
 */
export async function createSubscription(
  userId: string,
  tier: SubscriptionTier = 'FREE',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  return await prisma.subscription.create({
    data: {
      userId,
      tier,
      status: 'ACTIVE',
      startDate: new Date(),
      stripeCustomerId,
      stripeSubscriptionId,
    },
  });
}

/**
 * Update subscription tier (e.g., upgrade to premium)
 */
export async function updateSubscriptionTier(
  userId: string,
  newTier: SubscriptionTier
) {
  return await prisma.subscription.update({
    where: { userId },
    data: {
      tier: newTier,
      status: 'ACTIVE',
      updatedAt: new Date(),
    },
  });
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(userId: string) {
  return await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'CANCELED',
      endDate: new Date(),
      updatedAt: new Date(),
    },
  });
}

/**
 * Reactivate a canceled subscription
 */
export async function reactivateSubscription(userId: string) {
  return await prisma.subscription.update({
    where: { userId },
    data: {
      status: 'ACTIVE',
      endDate: null,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update subscription status (for webhook handling)
 */
export async function updateSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus
) {
  return await prisma.subscription.update({
    where: { userId },
    data: {
      status,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get subscription features based on tier
 */
export function getSubscriptionFeatures(tier: SubscriptionTier): string[] {
  if (tier === 'PREMIUM') {
    return [
      'Full course access',
      'Unlimited lessons',
      'Course certificates',
      'No advertisements',
      'Priority support',
      'Download lesson materials',
    ];
  }

  return [
    'Access to free games',
    'First 2-3 lessons of premium courses',
    'Basic progress tracking',
    'Community features',
  ];
}

/**
 * Check if user can access premium content
 * Convenience wrapper for hasActivePremiumSubscription
 */
export async function canAccessPremiumContent(
  userId: string
): Promise<boolean> {
  return await hasActivePremiumSubscription(userId);
}
