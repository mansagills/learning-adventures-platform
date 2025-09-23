'use client';

import { useState } from 'react';
import Icon from './Icon';

interface FilterState {
  gradeLevel: string;
  type: string;
  difficulty: string;
  category: string;
}

interface AdventureFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export default function AdventureFilters({
  onFilterChange,
  totalCount,
  filteredCount
}: AdventureFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    gradeLevel: '',
    type: '',
    difficulty: '',
    category: ''
  });

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      gradeLevel: '',
      type: '',
      difficulty: '',
      category: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white border-b border-gray-100 py-6">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <Icon name="filter" size={20} className="text-ink-600" />
            <span className="text-ink-600 font-medium">Filter by:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              aria-label="Filter by subject category"
            >
              <option value="">All Subjects</option>
              <option value="math">Math</option>
              <option value="science">Science</option>
              <option value="english">English Language Arts</option>
              <option value="history">History</option>
              <option value="interdisciplinary">Interdisciplinary</option>
            </select>

            {/* Grade Level Filter */}
            <select
              value={filters.gradeLevel}
              onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              aria-label="Filter by grade level"
            >
              <option value="">All Grades</option>
              <option value="K">Kindergarten</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              aria-label="Filter by content type"
            >
              <option value="">All Types</option>
              <option value="lesson">Lessons</option>
              <option value="game">Games</option>
            </select>

            {/* Difficulty Filter */}
            <select
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              aria-label="Filter by difficulty level"
            >
              <option value="">All Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-brand-500 hover:text-brand-600 font-medium transition-colors duration-250"
              aria-label="Clear all filters"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-ink-600">
          {hasActiveFilters ? (
            <>
              Showing <span className="font-semibold">{filteredCount}</span> of{' '}
              <span className="font-semibold">{totalCount}</span> adventures
            </>
          ) : (
            <>
              Showing all <span className="font-semibold">{totalCount}</span> adventures
            </>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-100 text-brand-700">
              Subject: {
                filters.category === 'math' ? 'Math' :
                filters.category === 'science' ? 'Science' :
                filters.category === 'english' ? 'English Language Arts' :
                filters.category === 'history' ? 'History' :
                filters.category === 'interdisciplinary' ? 'Interdisciplinary' :
                filters.category
              }
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-2 text-brand-500 hover:text-brand-700"
                aria-label="Remove category filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.gradeLevel && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-100 text-brand-700">
              Grade: {filters.gradeLevel === 'K' ? 'Kindergarten' : `Grade ${filters.gradeLevel}`}
              <button
                onClick={() => handleFilterChange('gradeLevel', '')}
                className="ml-2 text-brand-500 hover:text-brand-700"
                aria-label="Remove grade level filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-100 text-brand-700">
              Type: {filters.type === 'lesson' ? 'Lessons' : 'Games'}
              <button
                onClick={() => handleFilterChange('type', '')}
                className="ml-2 text-brand-500 hover:text-brand-700"
                aria-label="Remove type filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.difficulty && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-brand-100 text-brand-700">
              Difficulty: {filters.difficulty.charAt(0).toUpperCase() + filters.difficulty.slice(1)}
              <button
                onClick={() => handleFilterChange('difficulty', '')}
                className="ml-2 text-brand-500 hover:text-brand-700"
                aria-label="Remove difficulty filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}