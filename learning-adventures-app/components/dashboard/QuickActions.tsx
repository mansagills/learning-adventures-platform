'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '../Icon';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  emoji: string;
  href: string;
  color: string;
  bgColor: string;
  borderColor: string;
  count?: number;
}

interface QuickActionsProps {
  continueCount?: number;
  newAdventuresCount?: number;
  achievementsCount?: number;
  friendsOnline?: number;
}

export default function QuickActions({
  continueCount = 0,
  newAdventuresCount = 0,
  achievementsCount = 0,
  friendsOnline = 0
}: QuickActionsProps) {

  const actions: QuickAction[] = [
    {
      id: 'continue',
      title: 'Continue Learning',
      description: continueCount > 0 ? `${continueCount} in progress` : 'Pick up where you left off',
      icon: 'play',
      emoji: '▶️',
      href: '#continue-learning',
      color: 'text-brand-600',
      bgColor: 'bg-brand-50',
      borderColor: 'border-brand-200',
      count: continueCount,
    },
    {
      id: 'explore',
      title: 'Explore New',
      description: newAdventuresCount > 0 ? `${newAdventuresCount} new adventures!` : 'Discover something new',
      icon: 'explore',
      emoji: '🗺️',
      href: '/catalog',
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
      borderColor: 'border-accent-200',
      count: newAdventuresCount,
    },
    {
      id: 'achievements',
      title: 'My Achievements',
      description: achievementsCount > 0 ? `${achievementsCount} badges earned!` : 'Check your progress',
      icon: 'shield',
      emoji: '🏆',
      href: '#achievements',
      color: 'text-sunshine-600',
      bgColor: 'bg-sunshine-50',
      borderColor: 'border-sunshine-200',
      count: achievementsCount,
    },
    {
      id: 'daily',
      title: 'Daily Challenge',
      description: 'Complete today\'s quest!',
      icon: 'star',
      emoji: '⭐',
      href: '/daily-challenge',
      color: 'text-coral-600',
      bgColor: 'bg-coral-50',
      borderColor: 'border-coral-200',
    },
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-900 mb-6">
        Quick Actions ⚡
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link
            key={action.id}
            href={action.href}
            className="group block animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={`relative overflow-hidden ${action.bgColor} ${action.borderColor} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer`}>
              {/* Count badge */}
              {action.count !== undefined && action.count > 0 && (
                <div className="absolute top-3 right-3 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md animate-bounce-in">
                  <span className={`${action.color} text-sm font-bold`}>
                    {action.count}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-14 h-14 mb-4 bg-white rounded-xl flex items-center justify-center text-3xl shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                {action.emoji}
              </div>

              {/* Content */}
              <h3 className={`text-lg font-display font-bold ${action.color} mb-1 group-hover:translate-x-1 transition-transform`}>
                {action.title}
              </h3>
              <p className="text-ink-600 text-sm">
                {action.description}
              </p>

              {/* Arrow on hover */}
              <div className={`mt-3 flex items-center ${action.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                <Icon name="chevronRight" size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </div>

              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/50 rounded-full"></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
