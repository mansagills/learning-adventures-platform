'use client';

import Link from 'next/link';

interface WelcomeBackBannerProps {
  userName?: string | null;
}

export default function WelcomeBackBanner({
  userName,
}: WelcomeBackBannerProps) {
  const displayName = userName?.split(' ')[0] || 'Adventurer';

  return (
    <div className="bg-gradient-to-r from-pg-violet to-pg-pink border-b-2 border-pg-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👋</span>
            <p className="text-white font-semibold text-lg">
              Welcome back, {displayName}! Your world awaits.
            </p>
          </div>
          <Link
            href="/world/create"
            className="relative inline-flex items-center justify-center gap-2 font-bold rounded-full border-2 border-pg-border transition-all duration-200 ease-bounce focus:outline-none focus:ring-2 focus:ring-pg-violet focus:ring-offset-2 bg-white text-pg-violet shadow-pop hover:bg-pg-yellow hover:text-foreground hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active px-6 py-3 text-base"
          >
            Enter the World →
          </Link>
        </div>
      </div>
    </div>
  );
}
