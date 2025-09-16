'use client';

import { CategoryData } from '@/lib/catalogData';
import Carousel from './Carousel';
import AdventureCard from './AdventureCard';
import Container from './Container';
import Icon from './Icon';

interface CategorySectionProps {
  category: CategoryData;
  className?: string;
}

export default function CategorySection({
  category,
  className
}: CategorySectionProps) {
  const { lessons, games } = category.adventures;

  return (
    <section className={className}>
      <Container>
        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center">
              <Icon name={category.icon} size={32} className="text-white" />
            </div>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-ink-900 mb-4">
            {category.name}
          </h2>
          <p className="text-xl text-ink-600 max-w-3xl mx-auto">
            {category.description}
          </p>
        </div>

        {/* Lessons Section */}
        {lessons.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-2xl font-bold text-ink-900 mb-2">
                  Interactive Lessons
                </h3>
                <p className="text-ink-600">
                  Hands-on learning experiences that build understanding step by step
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-ink-600">
                <Icon name="academic" size={16} />
                <span>{lessons.length} lessons</span>
              </div>
            </div>

            <Carousel
              itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
              showDots={true}
              showArrows={true}
              gap="gap-6"
            >
              {lessons.map((lesson) => (
                <AdventureCard
                  key={lesson.id}
                  adventure={lesson}
                  size="medium"
                />
              ))}
            </Carousel>
          </div>
        )}

        {/* Games Section */}
        {games.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-display text-2xl font-bold text-ink-900 mb-2">
                  Educational Games
                </h3>
                <p className="text-ink-600">
                  Fun and engaging games that make learning feel like play
                </p>
              </div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-ink-600">
                <Icon name="play" size={16} />
                <span>{games.length} games</span>
              </div>
            </div>

            <Carousel
              itemsPerView={{ mobile: 1, tablet: 2, desktop: 3 }}
              showDots={true}
              showArrows={true}
              gap="gap-6"
            >
              {games.map((game) => (
                <AdventureCard
                  key={game.id}
                  adventure={game}
                  size="medium"
                />
              ))}
            </Carousel>
          </div>
        )}

        {/* Quick Stats */}
        <div className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-2xl p-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-brand-500 mb-2">
                {lessons.length + games.length}
              </div>
              <div className="text-ink-600">Total Adventures</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-500 mb-2">
                {lessons.length}
              </div>
              <div className="text-ink-600">Interactive Lessons</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-500 mb-2">
                {games.length}
              </div>
              <div className="text-ink-600">Educational Games</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}