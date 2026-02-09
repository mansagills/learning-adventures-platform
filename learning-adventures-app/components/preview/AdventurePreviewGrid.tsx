'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  getPreviewAdventuresForAllCategories,
  getCategoryMetadata,
  Adventure,
} from '@/lib/catalogData';
import Container from '../Container';
import SubjectPreviewSection from './SubjectPreviewSection';
import { PreviewGridSkeleton } from './PreviewSkeleton';

interface CategoryPreviewData {
  id: string;
  name: string;
  description: string;
  icon: string;
  adventures: Adventure[];
  totalAdventures: number;
  featuredAdventures: number;
}

export default function AdventurePreviewGrid() {
  const { status } = useSession();
  const [categoryData, setCategoryData] = useState<CategoryPreviewData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine preview limit based on authentication status
  // Show limited preview during loading state and for unauthenticated users
  const isAuthenticated = status === 'authenticated';
  const previewLimit = isAuthenticated ? 5 : 3;

  useEffect(() => {
    // Don't load data while session is still loading
    if (status === 'loading') {
      return;
    }

    const loadPreviewData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get category metadata and preview adventures
        const metadata = getCategoryMetadata();
        const previewAdventures =
          getPreviewAdventuresForAllCategories(previewLimit);

        // Combine metadata with preview data
        const combinedData: CategoryPreviewData[] = metadata.map(
          (category) => ({
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            adventures: previewAdventures[category.id] || [],
            totalAdventures: category.totalAdventures,
            featuredAdventures: category.featuredAdventures,
          })
        );

        setCategoryData(combinedData);
      } catch (err) {
        console.error('Error loading preview data:', err);
        setError('Failed to load adventure previews');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreviewData();
  }, [status, previewLimit]);

  // Only show loading skeleton if we have no data yet
  if (isLoading && categoryData.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="text-center mb-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
            </div>
          </div>
          <PreviewGridSkeleton />
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="text-center">
            <h2 className="text-3xl font-bold text-ink-800 mb-4">
              Explore Learning Adventures
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </Container>
      </section>
    );
  }

  const totalAdventures = categoryData.reduce(
    (sum, category) => sum + category.totalAdventures,
    0
  );
  const totalFeatured = categoryData.reduce(
    (sum, category) => sum + category.featuredAdventures,
    0
  );

  return (
    <section className="py-16 bg-gray-50">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-ink-800 mb-4">
            Explore Learning Adventures
          </h2>
          <p className="text-lg text-ink-600 max-w-2xl mx-auto mb-6">
            Discover interactive games and lessons across all subjects. Each
            adventure is designed to make learning engaging and fun for students
            of all grade levels.
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-6 text-sm text-ink-500">
            <div className="flex items-center space-x-1">
              <span className="font-medium text-brand-600">
                {totalAdventures}
              </span>
              <span>Total Adventures</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-accent-600">
                {totalFeatured}
              </span>
              <span>Featured</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium text-green-600">
                {categoryData.length}
              </span>
              <span>Subject Areas</span>
            </div>
          </div>
        </div>

        {/* Preview Sections */}
        <div className="space-y-16">
          {categoryData.map((category) => (
            <SubjectPreviewSection
              key={category.id}
              categoryId={category.id}
              categoryName={category.name}
              categoryDescription={category.description}
              categoryIcon={category.icon}
              adventures={category.adventures}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 pt-12 border-t border-gray-200">
          {!isAuthenticated ? (
            <>
              <h3 className="text-2xl font-bold text-ink-800 mb-4">
                Sign In to Unlock All Adventures!
              </h3>
              <p className="text-ink-600 mb-6 max-w-xl mx-auto">
                You're viewing a limited preview. Create a free account to
                access our complete catalog of {totalAdventures} educational
                adventures, track your progress, and earn achievements.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => {
                    const event = new CustomEvent('openAuthModal', {
                      detail: { defaultTab: 'signup' },
                    });
                    window.dispatchEvent(event);
                  }}
                  className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
                >
                  Create Free Account
                </button>
                <button
                  onClick={() => {
                    const event = new CustomEvent('openAuthModal', {
                      detail: { defaultTab: 'login' },
                    });
                    window.dispatchEvent(event);
                  }}
                  className="px-6 py-3 bg-white text-brand-600 border border-brand-300 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors font-medium"
                >
                  Sign In
                </button>
              </div>
              <p className="text-sm text-ink-500 mt-4">
                Already have an account? Sign in to see more adventures and
                continue your learning journey.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-ink-800 mb-4">
                Ready to Start Learning?
              </h3>
              <p className="text-ink-600 mb-6 max-w-xl mx-auto">
                Browse our complete catalog of educational adventures, or jump
                right into a featured game or lesson to begin your learning
                journey.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <a
                  href="/catalog"
                  className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
                >
                  Browse All Adventures
                </a>
                <a
                  href="/dashboard"
                  className="px-6 py-3 bg-white text-brand-600 border border-brand-300 rounded-lg hover:bg-brand-50 hover:border-brand-400 transition-colors font-medium"
                >
                  View My Dashboard
                </a>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
