'use client';

import React from 'react';
import Icon from '../Icon';

interface DashboardHeroProps {
  userName?: string;
  userLevel?: number;
  totalXP?: number;
  streak?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}

export default function DashboardHero({
  userName = 'Explorer',
  userLevel = 1,
  totalXP = 0,
  streak = 0,
  timeOfDay = getTimeOfDay()
}: DashboardHeroProps) {

  const greetings = {
    morning: ['Good morning', 'Rise and shine', 'Hello sunshine'],
    afternoon: ['Good afternoon', 'Hey there', 'Happy learning'],
    evening: ['Good evening', 'Welcome back', 'Great to see you']
  };

  const randomGreeting = greetings[timeOfDay][Math.floor(Math.random() * greetings[timeOfDay].length)];

  const mascots = ['🦁', '🐯', '🦊', '🐼', '🐨', '🦉', '🦅', '🦄', '🐸', '🐙'];
  const mascot = mascots[userName.charCodeAt(0) % mascots.length];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-600 p-8 md:p-12 shadow-fun-lg mb-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sunshine-400 rounded-full opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-coral-400 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left side - Greeting and mascot */}
        <div className="flex items-center gap-4">
          {/* Animated mascot */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-5xl md:text-6xl shadow-lg animate-bounce-in">
            {mascot}
          </div>

          {/* Greeting text */}
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-white mb-1 animate-slide-up">
              {randomGreeting}, {userName}!
            </h1>
            <p className="text-white/90 text-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Ready for another adventure? 🚀
            </p>
          </div>
        </div>

        {/* Right side - Stats badges */}
        <div className="flex flex-wrap gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Level badge */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border-2 border-white/30 hover:scale-105 transition-transform cursor-default">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sunshine-400 rounded-full flex items-center justify-center">
                <Icon name="star" size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-semibold">Level</p>
                <p className="text-white text-xl font-bold">{userLevel}</p>
              </div>
            </div>
          </div>

          {/* XP badge */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border-2 border-white/30 hover:scale-105 transition-transform cursor-default">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent-400 rounded-full flex items-center justify-center">
                <Icon name="academic" size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs font-semibold">Total XP</p>
                <p className="text-white text-xl font-bold">{totalXP.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Streak badge */}
          {streak > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 border-2 border-white/30 hover:scale-105 transition-transform cursor-default">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-coral-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">🔥</span>
                </div>
                <div>
                  <p className="text-white/80 text-xs font-semibold">Streak</p>
                  <p className="text-white text-xl font-bold">{streak} days</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom motivational message */}
      <div className="relative z-10 mt-6 md:mt-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 border border-white/20 inline-block animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-white text-sm md:text-base flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="font-semibold">
              {getMotivationalMessage(streak, userLevel)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to determine time of day
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

// Helper function for motivational messages
function getMotivationalMessage(streak: number, level: number): string {
  if (streak >= 7) {
    return "Amazing streak! You're on fire! 🔥";
  }
  if (streak >= 3) {
    return "Keep that streak going! You're doing great! 💪";
  }
  if (level >= 10) {
    return "Wow! You're becoming a learning champion! 🏆";
  }
  if (level >= 5) {
    return "You're making awesome progress! Keep it up! 🌟";
  }
  return "Every adventure makes you smarter! Let's learn! 🚀";
}
