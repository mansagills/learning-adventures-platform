'use client';

import Link from 'next/link';
import Button from '@/components/Button';

interface WelcomeBackBannerProps {
  userName?: string | null;
}

export default function WelcomeBackBanner({ userName }: WelcomeBackBannerProps) {
  const displayName = userName?.split(' ')[0] || 'Adventurer';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';

  return (
    <div className="bg-gradient-to-r from-pg-violet to-pg-pink border-b-2 border-pg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👋</span>
            <p className="text-white font-semibold text-lg">
              Welcome back, {displayName}!
            </p>
          </div>
          <Link href={`${appUrl}/dashboard`}>
            <Button variant="candy" size="md" className="bg-white text-pg-violet hover:bg-pg-yellow hover:text-foreground">
              Continue to Dashboard →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
