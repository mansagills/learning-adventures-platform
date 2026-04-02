'use client';

import Image from 'next/image';
import Link from 'next/link';
import Container from './Container';
import Button from './Button';
import { analytics } from '@/lib/analytics';

export default function Hero() {
  const handleEnterWorld = () => {
    analytics.clickCTA('Enter the World', 'hero');
  };

  const handleCreateCharacter = () => {
    analytics.clickCTA('Create Your Character', 'hero');
  };

  return (
    <section className="relative bg-background pt-20 pb-24 overflow-hidden">
      {/* Dot grid pattern background */}
      <div className="absolute inset-0 bg-dot-grid opacity-40"></div>

      {/* Large decorative glow behind content */}
      <div className="absolute top-10 left-0 w-[500px] h-[500px] bg-pg-violet/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pg-mint/20 rounded-full blur-3xl"></div>

      {/* Floating pixel-style decorative elements */}
      <div className="absolute top-32 right-20 w-8 h-8 bg-pg-pink rotate-45 opacity-60 animate-float"></div>
      <div
        className="absolute top-48 right-40 w-6 h-6 bg-pg-violet rounded-sm opacity-50 animate-float"
        style={{ animationDelay: '0.5s' }}
      ></div>
      <div
        className="absolute bottom-32 right-32 w-4 h-4 bg-pg-yellow opacity-60 animate-float"
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className="absolute top-64 left-20 w-5 h-5 bg-pg-mint rounded-sm opacity-50 animate-float"
        style={{ animationDelay: '1.5s' }}
      ></div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-white border-2 border-pg-border rounded-full shadow-pop">
              <span className="w-8 h-8 bg-pg-violet rounded-sm flex items-center justify-center text-lg">
                🗺️
              </span>
              <span className="text-sm font-bold text-foreground uppercase tracking-wide">
                A Living Pixel World
              </span>
            </div>

            <h1 className="font-outfit text-5xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 leading-tight">
              Your{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-pg-violet">Adventure</span>
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
              </span>{' '}
              Awaits
            </h1>

            <p className="font-plus-jakarta text-xl md:text-2xl text-foreground/80 mb-10 leading-relaxed">
              Explore a vast pixel world, go on quests, level up your character
              — and learn along the way.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/world" onClick={handleEnterWorld}>
                <Button variant="candy" size="lg" className="text-lg w-full sm:w-auto">
                  <span className="w-7 h-7 bg-white/20 rounded-sm flex items-center justify-center mr-2">
                    🌍
                  </span>
                  Enter the World
                </Button>
              </Link>
              <Button
                variant="outline-pop"
                size="lg"
                onClick={handleCreateCharacter}
              >
                Create Your Character →
              </Button>
            </div>
          </div>

          {/* Hero visual area */}
          <div className="relative">
            {/* Jaylen & S.P.A.R.K. hero image */}
            <div className="relative rounded-3xl border-2 border-pg-border shadow-pop">
              <Image
                src="/images/jaylen-and-spark.png"
                alt="Jaylen the Adventurer and S.P.A.R.K. the Tech Buddy — mascots of Learning Adventures"
                width={1376}
                height={768}
                className="w-full h-auto rounded-3xl"
                priority
              />
            </div>

            {/* Floating stat stickers */}
            <div className="absolute -top-6 -right-4 w-20 h-20 bg-pg-yellow border-2 border-pg-border rounded-xl shadow-pop rotate-12 flex flex-col items-center justify-center animate-float z-20">
              <span className="text-xl">⚡</span>
              <span className="font-outfit font-extrabold text-foreground text-xs">+50 XP</span>
            </div>
            <div
              className="absolute -bottom-4 -left-4 w-24 h-20 bg-pg-mint border-2 border-pg-border rounded-2xl shadow-pop -rotate-6 flex flex-col items-center justify-center animate-float z-20"
              style={{ animationDelay: '1s' }}
            >
              <span className="text-2xl">🗡️</span>
              <span className="font-outfit font-extrabold text-foreground text-xs">New Quest!</span>
            </div>
            <div
              className="absolute top-1/3 -right-8 w-16 h-16 bg-pg-pink border-2 border-pg-border rounded-full shadow-pop flex flex-col items-center justify-center animate-float z-20"
              style={{ animationDelay: '2s' }}
            >
              <span className="text-xl">🏆</span>
              <span className="font-outfit font-extrabold text-foreground text-xs">Lv. 12</span>
            </div>
          </div>
        </div>

        {/* World stats — pixel game style */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto lg:mx-0">
          <div className="card-sticker group hover:-translate-y-1 transition-transform duration-200 ease-bounce">
            <div className="flex items-center gap-3">
              <div className="icon-circle-violet">
                <span className="text-lg">🌍</span>
              </div>
              <div>
                <div className="font-outfit text-3xl font-bold text-pg-violet">
                  1 World
                </div>
                <div className="text-sm text-foreground/70 font-medium">
                  Always Growing
                </div>
              </div>
            </div>
          </div>

          <div className="card-sticker group hover:-translate-y-1 transition-transform duration-200 ease-bounce">
            <div className="flex items-center gap-3">
              <div className="icon-circle-pink">
                <span className="text-lg">⚔️</span>
              </div>
              <div>
                <div className="font-outfit text-3xl font-bold text-pg-pink">
                  100+
                </div>
                <div className="text-sm text-foreground/70 font-medium">
                  Quests & Challenges
                </div>
              </div>
            </div>
          </div>

          <div className="card-sticker group hover:-translate-y-1 transition-transform duration-200 ease-bounce">
            <div className="flex items-center gap-3">
              <div className="icon-circle-yellow">
                <span className="text-lg">⭐</span>
              </div>
              <div>
                <div className="font-outfit text-3xl font-bold text-pg-yellow">
                  K–5
                </div>
                <div className="text-sm text-foreground/70 font-medium">
                  Grade Levels
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
