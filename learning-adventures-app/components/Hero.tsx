'use client';

import Image from 'next/image';
import Container from './Container';
import Button from './Button';
import TrustBadges from './TrustBadges';
import { analytics } from '@/lib/analytics';

export default function Hero() {
  const handlePrimaryCTA = () => {
    analytics.clickCTA('Start Your Adventure', 'hero');
  };

  const handleSecondaryCTA = () => {
    analytics.clickCTA('Explore the Adventure Catalog', 'hero');
  };

  return (
    <section className="relative bg-background pt-20 pb-24 overflow-hidden">
      {/* Dot grid pattern background */}
      <div className="absolute inset-0 bg-dot-grid opacity-40"></div>

      {/* Large decorative yellow circle behind content */}
      <div className="absolute top-10 left-0 w-[500px] h-[500px] bg-pg-yellow/20 rounded-full blur-3xl"></div>

      {/* Floating confetti shapes */}
      <div className="absolute top-32 right-20 w-8 h-8 bg-pg-pink rotate-45 opacity-60 animate-float"></div>
      <div
        className="absolute top-48 right-40 w-6 h-6 bg-pg-violet rounded-full opacity-50 animate-float"
        style={{ animationDelay: '0.5s' }}
      ></div>
      <div
        className="absolute bottom-32 right-32 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-pg-mint opacity-60 animate-float"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="absolute top-64 left-20 w-5 h-5 bg-pg-yellow rounded-full opacity-50 animate-float"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Playful badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-white border-2 border-pg-border rounded-full shadow-pop">
              <span className="w-8 h-8 bg-pg-yellow rounded-full flex items-center justify-center text-lg">
                🚀
              </span>
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                Learning Adventures
              </span>
            </div>

            <h1 className="font-outfit text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              Transform Learning Into an{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-pg-violet">Adventure!</span>
                {/* Squiggle underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-4"
                  viewBox="0 0 200 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6C20 2 40 10 60 6C80 2 100 10 120 6C140 2 160 10 180 6C190 4 198 6 198 6"
                    stroke="#F472B6"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="font-plus-jakarta text-xl md:text-2xl text-foreground/80 mb-8 leading-relaxed">
              Interactive games, fun experiments, and exciting lessons designed
              for kids who love to learn!
            </p>

            {/* Trust Badges */}
            <div className="mb-10">
              <TrustBadges />
            </div>

            {/* CTAs with Candy Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="candy"
                size="lg"
                onClick={handlePrimaryCTA}
                data-analytics="hero-primary-cta"
                className="text-lg"
              >
                <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center mr-2">
                  🎉
                </span>
                Start Your Adventure
              </Button>
              <Button
                variant="outline-pop"
                size="lg"
                onClick={handleSecondaryCTA}
                data-analytics="hero-secondary-cta"
              >
                Explore Adventures →
              </Button>
            </div>
          </div>

          {/* Hero Image Area */}
          <div className="relative">
            {/* Dotted pattern behind image */}
            <div className="absolute -inset-4 bg-dot-grid opacity-30 rounded-3xl"></div>

            {/* Main image container with blob mask */}
            <div className="relative z-10 blob-mask bg-gradient-to-br from-pg-violet/20 via-pg-pink/20 to-pg-yellow/20 p-2">
              <div className="blob-mask bg-white border-2 border-pg-border overflow-hidden">
                {/* Placeholder for hero image */}
                <div className="w-full h-80 md:h-96 flex items-center justify-center bg-gradient-to-br from-pg-violet/10 via-pg-pink/10 to-pg-yellow/10">
                  <div className="text-7xl">🎓📚✨</div>
                </div>
              </div>
            </div>

            {/* Floating sticker decorations */}
            <div className="absolute -top-6 -right-4 w-16 h-16 bg-pg-yellow border-2 border-pg-border rounded-xl shadow-pop rotate-12 flex items-center justify-center animate-float">
              <span className="text-2xl">⭐</span>
            </div>
            <div
              className="absolute -bottom-4 -left-4 w-20 h-20 bg-pg-mint border-2 border-pg-border rounded-2xl shadow-pop -rotate-6 flex items-center justify-center animate-float"
              style={{ animationDelay: '1s' }}
            >
              <span className="text-3xl">🎯</span>
            </div>
            <div
              className="absolute top-1/3 -right-8 w-14 h-14 bg-pg-pink border-2 border-pg-border rounded-full shadow-pop flex items-center justify-center animate-float"
              style={{ animationDelay: '2s' }}
            >
              <span className="text-xl">🚀</span>
            </div>
          </div>
        </div>

        {/* Social Proof Stats - Sticker Style */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto lg:mx-0">
          {/* Stat Card 1 */}
          <div className="card-sticker group hover:-translate-y-1 transition-transform duration-200 ease-bounce">
            <div className="flex items-center gap-3">
              <div className="icon-circle-violet">
                <span className="text-lg">👨‍👩‍👧‍👦</span>
              </div>
              <div>
                <div className="font-outfit text-3xl font-bold text-pg-violet">
                  50K+
                </div>
                <div className="text-sm text-foreground/70 font-medium">
                  Happy Families
                </div>
              </div>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="card-sticker group hover:-translate-y-1 transition-transform duration-200 ease-bounce">
            <div className="flex items-center gap-3">
              <div className="icon-circle-pink">
                <span className="text-lg">⭐</span>
              </div>
              <div>
                <div className="font-outfit text-3xl font-bold text-pg-pink">
                  95%
                </div>
                <div className="text-sm text-foreground/70 font-medium">
                  Success Rate
                </div>
              </div>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="card-sticker group hover:-translate-y-1 transition-transform duration-200 ease-bounce">
            <div className="flex items-center gap-3">
              <div className="icon-circle-yellow">
                <span className="text-lg">🚀</span>
              </div>
              <div>
                <div className="font-outfit text-3xl font-bold text-pg-yellow">
                  200+
                </div>
                <div className="text-sm text-foreground/70 font-medium">
                  Adventures
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
