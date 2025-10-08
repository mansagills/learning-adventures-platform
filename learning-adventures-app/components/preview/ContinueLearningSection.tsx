'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Adventure, getAdventureById } from '@/lib/catalogData';
import { useInView } from '@/hooks/useInView';
import Container from '../Container';
import AdventurePreviewCard from './AdventurePreviewCard';
import Icon from '../Icon';

interface UserProgress {
  adventureId: string;
  progress: number;
  lastAccessedAt: Date;
}

export default function ContinueLearningSection() {
  const { data: session, status } = useSession();
  const [recentAdventures, setRecentAdventures] = useState<Array<{adventure: Adventure, progress: number}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Intersection observer for fade-in animation
  const [sectionRef, isInView] = useInView<HTMLDivElement>({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (status === 'loading') return;

    const loadRecentProgress = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch user's recent progress
        const response = await fetch('/api/progress/user');
        if (!response.ok) throw new Error('Failed to fetch progress');

        const data = await response.json();

        // Get in-progress adventures (not completed, progress > 0)
        const inProgress = data.progress
          .filter((p: UserProgress) => p.progress > 0 && p.progress < 100)
          .sort((a: UserProgress, b: UserProgress) =>
            new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime()
          )
          .slice(0, 5); // Show top 5 recent

        // Map to adventures with progress
        const adventuresWithProgress = inProgress
          .map((p: UserProgress) => ({
            adventure: getAdventureById(p.adventureId),
            progress: p.progress
          }))
          .filter((item: {adventure: Adventure | null}) => item.adventure !== null);

        setRecentAdventures(adventuresWithProgress as Array<{adventure: Adventure, progress: number}>);
      } catch (error) {
        console.error('Error loading recent progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentProgress();
  }, [session?.user?.id, status]);

  // Don't show section if user is not logged in or has no in-progress adventures
  if (status !== 'authenticated' || (!isLoading && recentAdventures.length === 0)) {
    return null;
  }

  if (isLoading) {
    return (
      <section className="py-12 bg-white border-b border-gray-100">
        <Container>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="flex space-x-4 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-72 h-40 bg-gray-200 rounded-lg flex-shrink-0"></div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className={`py-12 bg-gradient-to-br from-brand-50 to-accent-50 border-b border-gray-100 transition-all duration-700 ${
        isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <Container>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-brand-500 to-accent-500 rounded-lg">
              <Icon name="play" size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ink-800">Continue Learning</h2>
              <p className="text-ink-600">Pick up where you left off</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All Progress</span>
            <Icon name="arrow-right" size={16} />
          </a>
        </div>

        {/* Adventure Cards */}
        <div className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth smooth-scroll touch-pan-x pb-4">
          {recentAdventures.map(({ adventure, progress }) => (
            <AdventurePreviewCard
              key={adventure.id}
              adventure={adventure}
              compact={true}
              showProgress={true}
              progress={progress}
            />
          ))}
        </div>

        {/* Helper text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-ink-500">
            {recentAdventures.length} {recentAdventures.length === 1 ? 'adventure' : 'adventures'} in progress
          </p>
        </div>
      </Container>
    </section>
  );
}
