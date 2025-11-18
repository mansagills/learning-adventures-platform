'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../Icon';

interface SubjectCardData {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgGradient: string;
  completedCount: number;
  totalCount: number;
  recentlyPlayed?: boolean;
}

interface SubjectCardsProps {
  subjects: SubjectCardData[];
}

export default function SubjectCards({ subjects }: SubjectCardsProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900">
            Choose Your Adventure! 🎮
          </h2>
          <p className="text-ink-600 mt-1">Pick a subject and start exploring</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {subjects.map((subject, index) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            animationDelay={index * 0.1}
          />
        ))}
      </div>
    </div>
  );
}

function SubjectCard({ subject, animationDelay }: { subject: SubjectCardData; animationDelay: number }) {
  const completionPercentage = subject.totalCount > 0
    ? Math.round((subject.completedCount / subject.totalCount) * 100)
    : 0;

  return (
    <Link
      href={`/catalog?category=${subject.id}`}
      className="group block animate-scale-in"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <div className={`relative overflow-hidden rounded-2xl ${subject.bgGradient} p-6 shadow-lg hover:shadow-fun-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-white/50`}>
        {/* Recently played badge */}
        {subject.recentlyPlayed && (
          <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 text-xs font-bold text-brand-600 shadow-md animate-bounce-in">
            Playing 🎯
          </div>
        )}

        {/* Emoji icon */}
        <div className="w-16 h-16 mb-4 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
          {subject.emoji}
        </div>

        {/* Subject name */}
        <h3 className="text-xl font-display font-bold text-white mb-2 group-hover:translate-x-1 transition-transform">
          {subject.name}
        </h3>

        {/* Progress info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-white/90 font-semibold">
              {subject.completedCount} of {subject.totalCount}
            </span>
            <span className="text-white/90 font-bold">
              {completionPercentage}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/30 rounded-full h-2.5 overflow-hidden backdrop-blur-sm">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Arrow indicator on hover */}
        <div className="mt-4 flex items-center text-white/80 group-hover:text-white transition-colors">
          <span className="text-sm font-semibold mr-2">Explore</span>
          <Icon name="chevronRight" size={16} className="transform group-hover:translate-x-1 transition-transform" />
        </div>

        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full"></div>
        <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full"></div>
      </div>
    </Link>
  );
}

// Predefined subject configurations
export const defaultSubjects: SubjectCardData[] = [
  {
    id: 'math',
    name: 'Math',
    emoji: '🔢',
    color: '#3B82F6',
    bgGradient: 'bg-gradient-to-br from-ocean-400 to-ocean-600',
    completedCount: 0,
    totalCount: 0,
  },
  {
    id: 'science',
    name: 'Science',
    emoji: '🔬',
    color: '#22C55E',
    bgGradient: 'bg-gradient-to-br from-grass-400 to-grass-600',
    completedCount: 0,
    totalCount: 0,
  },
  {
    id: 'english',
    name: 'English',
    emoji: '📚',
    color: '#8B5CF6',
    bgGradient: 'bg-gradient-to-br from-brand-400 to-brand-600',
    completedCount: 0,
    totalCount: 0,
  },
  {
    id: 'history',
    name: 'History',
    emoji: '🏛️',
    color: '#F59E0B',
    bgGradient: 'bg-gradient-to-br from-sunshine-400 to-sunshine-600',
    completedCount: 0,
    totalCount: 0,
  },
  {
    id: 'interdisciplinary',
    name: 'Mixed Fun',
    emoji: '🎨',
    color: '#F43F5E',
    bgGradient: 'bg-gradient-to-br from-coral-400 to-coral-600',
    completedCount: 0,
    totalCount: 0,
  },
];
