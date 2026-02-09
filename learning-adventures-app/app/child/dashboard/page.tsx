'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/Icon';

interface ChildData {
  id: string;
  displayName: string;
  username: string;
  gradeLevel: string;
  avatarId: string;
}

const AVATAR_EMOJIS: Record<string, string> = {
  tiger: '🐯',
  dragon: '🐉',
  eagle: '🦅',
  dolphin: '🐬',
  fox: '🦊',
  lion: '🦁',
  bear: '🐻',
  wolf: '🐺',
  panda: '🐼',
  owl: '🦉',
  phoenix: '🔥',
  turtle: '🐢',
  penguin: '🐧',
  koala: '🐨',
  cheetah: '🐆',
  rocket: '🚀',
};

export default function ChildDashboardPage() {
  const router = useRouter();
  const [child, setChild] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/child/session');
      const data = await res.json();

      if (data.authenticated && data.child) {
        setChild(data.child);
      } else {
        router.push('/child/login');
      }
    } catch (err) {
      router.push('/child/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/child/logout', { method: 'POST' });
      router.push('/child/login');
    } catch (err) {
      router.push('/child/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-400 to-accent-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl animate-bounce mb-4">🌟</div>
          <p className="text-xl">Loading your adventures...</p>
        </div>
      </div>
    );
  }

  if (!child) {
    return null;
  }

  const avatarEmoji = AVATAR_EMOJIS[child.avatarId] || '🐯';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-3xl backdrop-blur-sm">
                {avatarEmoji}
              </div>
              <div>
                <h1 className="text-2xl font-bold">Hi, {child.displayName}!</h1>
                <p className="text-brand-100">
                  Grade {child.gradeLevel} Explorer
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Icon name="arrow-left" size={18} />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-8 mb-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Ready for an Adventure?
              </h2>
              <p className="text-white/90 text-lg">
                Choose a subject below to start learning!
              </p>
            </div>
            <div className="text-8xl">🚀</div>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SubjectCard
            title="Math"
            emoji="🔢"
            description="Numbers, puzzles, and problem solving!"
            color="from-blue-500 to-blue-600"
            href="/catalog?subject=math"
          />
          <SubjectCard
            title="Science"
            emoji="🔬"
            description="Explore nature and experiments!"
            color="from-green-500 to-green-600"
            href="/catalog?subject=science"
          />
          <SubjectCard
            title="English"
            emoji="📚"
            description="Reading, writing, and stories!"
            color="from-purple-500 to-purple-600"
            href="/catalog?subject=english"
          />
          <SubjectCard
            title="History"
            emoji="🏛️"
            description="Travel through time!"
            color="from-amber-500 to-amber-600"
            href="/catalog?subject=history"
          />
          <SubjectCard
            title="All Adventures"
            emoji="🎮"
            description="Browse everything!"
            color="from-pink-500 to-pink-600"
            href="/catalog"
          />
          <SubjectCard
            title="My Courses"
            emoji="📖"
            description="Continue your courses!"
            color="from-teal-500 to-teal-600"
            href="/courses"
          />
        </div>

        {/* Quick Stats (Placeholder) */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Your Progress
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Adventures" value="0" emoji="🎯" />
            <StatCard label="Badges" value="0" emoji="🏆" />
            <StatCard label="XP Points" value="0" emoji="⭐" />
            <StatCard label="Day Streak" value="0" emoji="🔥" />
          </div>
          <p className="text-center text-gray-500 mt-4">
            Start an adventure to earn points and badges!
          </p>
        </div>
      </main>
    </div>
  );
}

function SubjectCard({
  title,
  emoji,
  description,
  color,
  href,
}: {
  title: string;
  emoji: string;
  description: string;
  color: string;
  href: string;
}) {
  return (
    <Link
      href={href as any}
      className={`block p-6 bg-gradient-to-br ${color} rounded-2xl text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]`}
    >
      <div className="text-5xl mb-3">{emoji}</div>
      <h3 className="text-xl font-bold mb-1">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </Link>
  );
}

function StatCard({
  label,
  value,
  emoji,
}: {
  label: string;
  value: string;
  emoji: string;
}) {
  return (
    <div className="text-center p-4 bg-gray-50 rounded-xl">
      <div className="text-3xl mb-1">{emoji}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
