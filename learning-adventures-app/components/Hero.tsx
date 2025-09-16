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
    <section className="bg-gradient-to-br from-brand-100 via-white to-accent-500/10 pt-8 pb-16">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-ink-900 mb-6 text-balance">
              Transform Learning Into an{' '}
              <span className="gradient-text">Adventure</span>
            </h1>

            <p className="text-lg md:text-xl text-ink-600 mb-8 leading-relaxed">
              Discover interactive educational games and lessons designed specifically for elementary and middle school students. Make learning engaging, personalized, and fun for your child.
            </p>

            {/* Trust Badges */}
            <div className="mb-8">
              <TrustBadges />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={handlePrimaryCTA}
                data-analytics="hero-primary-cta"
                className="animate-scale-in"
              >
                Start Your Adventure
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleSecondaryCTA}
                data-analytics="hero-secondary-cta"
                className="animate-scale-in"
                style={{ animationDelay: '100ms' }}
              >
                Explore the Adventure Catalog
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-center lg:text-left">
              <div>
                <div className="text-2xl md:text-3xl font-bold text-brand-500">50K+</div>
                <div className="text-sm text-ink-600">Happy Families</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-brand-500">95%</div>
                <div className="text-sm text-ink-600">Success Rate</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-brand-500">200+</div>
                <div className="text-sm text-ink-600">Learning Adventures</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="/hero-image.jpg"
                alt="Children engaged in interactive learning with tablets and educational games"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+15/8Aej7vzLKrVagZ2lVzsWOlgDgR+2eKCY7aM+QhVsHc8DP0CXNN+u9jEK4YQDJgppvOeGkTq4GawX4mS5mI+CxvGN7wL8A/rGlTxKbR2Cv20F3d/ePn5t+kCCNhGQJKckb+C35L1rYCvK6z6KKKUFvSgaBebB3BSE+3vFRt5Tk1+VzKmWkM55BG4aJJkIznJX2oUhU6lLdPKvz2Zt5N5t7VKm5VQG/k/9k="
              />
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-sun-400 rounded-full opacity-20 animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-accent-500 rounded-full opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 -right-12 w-16 h-16 bg-brand-500 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>
      </Container>
    </section>
  );
}