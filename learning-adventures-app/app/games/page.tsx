'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Container from '@/components/Container';
import Icon from '@/components/Icon';
import ProtectedRoute from '@/components/ProtectedRoute';
import GameCard from '@/components/games/GameCard';
import { GamesGridSkeleton } from '@/components/games/GameCardSkeleton';
import {
  getGames,
  filterGames,
  searchGames,
  getUniqueSubjects,
} from '@/lib/games/gameHelpers';
import type { Adventure } from '@/lib/catalogData';

interface UserProgress {
  id: string;
  adventureId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  score: number | null;
  timeSpent: number;
  completedAt: Date | null;
  lastAccessed: Date;
}

function GamesContent() {
  const { data: session } = useSession();
  const [games, setGames] = useState<Adventure[]>([]);
  const [userProgress, setUserProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch games and user progress on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all games from catalogData
        const allGames = getGames();
        setGames(allGames);

        // Fetch user progress if authenticated
        if (session?.user?.id) {
          const response = await fetch('/api/progress/games');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              // Convert array to object for easy lookup
              const progressMap: Record<string, UserProgress> = {};
              data.data.forEach((p: UserProgress) => {
                progressMap[p.adventureId] = p;
              });
              setUserProgress(progressMap);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching games data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.user?.id]);

  // Get unique subjects for filter dropdown
  const subjects = useMemo(() => getUniqueSubjects(games), [games]);

  // Apply filters
  const filteredGames = useMemo(() => {
    let filtered = filterGames(games, selectedSubject, selectedDifficulty);
    filtered = searchGames(filtered, searchQuery);
    return filtered;
  }, [games, selectedSubject, selectedDifficulty, searchQuery]);

  // Check if any filters are active
  const hasActiveFilters = selectedSubject !== 'all' || selectedDifficulty !== 'all' || searchQuery !== '';

  // Clear all filters
  const clearFilters = () => {
    setSelectedSubject('all');
    setSelectedDifficulty('all');
    setSearchQuery('');
  };

  return (
    <Container className="py-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Learning Games</h1>
          <p className="text-lg text-ink-600">
            Explore {games.length} interactive games across all subjects
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4">
          {/* Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Icon
                name="search"
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>

            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            >
              <option value="all">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </option>
              ))}
            </select>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedSubject !== 'all' && (
                <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium flex items-center gap-1">
                  {selectedSubject.charAt(0).toUpperCase() + selectedSubject.slice(1)}
                  <button
                    onClick={() => setSelectedSubject('all')}
                    className="hover:text-brand-900"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </span>
              )}
              {selectedDifficulty !== 'all' && (
                <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium flex items-center gap-1">
                  {selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)}
                  <button
                    onClick={() => setSelectedDifficulty('all')}
                    className="hover:text-brand-900"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium flex items-center gap-1">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-brand-900">
                    <Icon name="close" size={14} />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-600">
          Showing {filteredGames.length} of {games.length} games
        </div>

        {/* Games Grid */}
        {loading ? (
          <GamesGridSkeleton count={9} />
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} progress={userProgress[game.id] || null} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="gamepad" size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-ink-900 mb-2">No games found</h3>
            <p className="text-gray-600 mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more games'
                : 'No games available at this time'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </Container>
  );
}

export default function GamesPage() {
  return (
    <ProtectedRoute>
      <GamesContent />
    </ProtectedRoute>
  );
}
