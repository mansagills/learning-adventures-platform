'use client';

import Link from 'next/link';
import Container from './Container';
import Button from './Button';
import { analytics } from '@/lib/analytics';

export default function SecondaryCta() {
  const handleEnterWorld = () => {
    analytics.clickCTA('Enter the World', 'secondary-cta');
  };

  const handleCreateCharacter = () => {
    analytics.clickCTA('Create Your Character', 'secondary-cta');
  };

  return (
    <section className="py-24 bg-pg-violet relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-grid opacity-10"></div>

      {/* Decorative glows */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-pg-pink/30 rounded-full blur-2xl"></div>
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-pg-yellow/20 rounded-full blur-2xl"></div>

      {/* Floating pixel decorations */}
      <div className="absolute top-20 right-20 w-12 h-12 bg-pg-yellow border-2 border-white/30 rounded-sm rotate-12 opacity-80 hidden lg:flex items-center justify-center">
        <span className="text-xl">⚡</span>
      </div>
      <div className="absolute bottom-16 left-16 w-10 h-10 bg-pg-mint border-2 border-white/30 rounded-sm opacity-80 hidden lg:flex items-center justify-center">
        <span className="text-lg">⚔️</span>
      </div>
      <div className="absolute top-1/2 left-10 w-8 h-8 bg-pg-pink border-2 border-white/30 rounded-sm -rotate-6 opacity-60 hidden lg:flex items-center justify-center">
        <span className="text-sm">🗡️</span>
      </div>

      <Container>
        <div className="text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-white border-2 border-pg-border rounded-full shadow-pop">
            <span className="text-lg">🗺️</span>
            <span className="text-sm font-bold text-foreground uppercase tracking-wide">
              Your Quest Awaits
            </span>
          </div>

          <h2 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6">
            Ready to Start Your{' '}
            <span className="relative inline-block">
              Adventure?
              <svg
                className="absolute -bottom-2 left-0 w-full h-4"
                viewBox="0 0 200 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 6C20 2 40 10 60 6C80 2 100 10 120 6C140 2 160 10 180 6C190 4 198 6 198 6"
                  stroke="#FBBF24"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>

          <p className="font-plus-jakarta text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            The campus is open. Your character is waiting. Thousands of quests,
            challenges, and secrets are out there — go find them.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link href="/world" onClick={handleEnterWorld}>
              <Button
                variant="candy-pink"
                size="lg"
                className="bg-white text-pg-violet border-pg-border hover:bg-pg-yellow hover:text-foreground w-full sm:w-auto"
              >
                <span className="w-6 h-6 bg-pg-violet/20 rounded-sm flex items-center justify-center mr-2">
                  🌍
                </span>
                Enter the World
              </Button>
            </Link>
            <Button
              variant="outline-pop"
              size="lg"
              onClick={handleCreateCharacter}
              className="bg-transparent border-white text-white hover:bg-pg-yellow hover:text-foreground hover:border-pg-border"
            >
              Create Your Character →
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pg-mint rounded-sm flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="font-plus-jakarta text-sm font-medium">
                Free to start
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pg-pink rounded-sm flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <span className="font-plus-jakarta text-sm font-medium">
                No credit card needed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-pg-yellow rounded-sm flex items-center justify-center">
                <span className="text-xs text-foreground">✓</span>
              </div>
              <span className="font-plus-jakarta text-sm font-medium">
                COPPA-compliant & kid-safe
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
