/**
 * Subscription Status API Route
 *
 * GET /api/subscriptions/status
 * Returns current user's subscription tier, status, and available features
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  getUserSubscription,
  getSubscriptionFeatures,
} from '@/lib/courses/subscriptionHelpers';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's subscription
    const subscription = await getUserSubscription(session.user.id);

    // Default to FREE tier if no subscription found
    const tier = subscription?.tier || 'FREE';
    const status = subscription?.status || 'ACTIVE';

    // Get features for this tier
    const features = getSubscriptionFeatures(tier);

    return NextResponse.json({
      tier,
      status,
      features,
      startDate: subscription?.startDate,
      endDate: subscription?.endDate,
      stripeCustomerId: subscription?.stripeCustomerId || null,
      stripeSubscriptionId: subscription?.stripeSubscriptionId || null,
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch subscription status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
