'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../Icon';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    label: 'Gemini Studio',
    href: '/internal/studio',
    icon: 'explore',
    description: 'AI-powered game creation',
  },
  {
    label: 'AI Agent Studio',
    href: '/internal/agent-studio',
    icon: 'rocket',
    description: 'Multi-agent workflows',
  },
  {
    label: 'Content Studio',
    href: '/internal',
    icon: 'upload',
    description: 'Upload games and lessons',
  },
  {
    label: 'Testing',
    href: '/internal/testing',
    icon: 'clipboard',
    description: 'Test and approve games',
  },
  {
    label: 'User Management',
    href: '/internal/users',
    icon: 'users',
    description: 'Manage platform users',
  },
  {
    label: 'Analytics',
    href: '/internal/analytics',
    icon: 'chart',
    description: 'View platform statistics',
  },
  {
    label: 'Content Management',
    href: '/internal/content',
    icon: 'settings',
    description: 'Manage existing content',
  },
];

export default function AdminPanel() {
  const pathname = usePathname();
  const [geminiStats, setGeminiStats] = useState({ total: 0, thisMonth: 0 });

  useEffect(() => {
    // Fetch Gemini stats
    fetch('/api/gemini/stats')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setGeminiStats({ total: data.total, thisMonth: data.thisMonth });
        }
      })
      .catch(() => {
        // Silently fail if API not available
      });
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
            <Icon name="settings" size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-ink-800">Admin Panel</h2>
            <p className="text-xs text-ink-500">Platform Management</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={`
                  flex items-start space-x-3 px-3 py-3 rounded-lg transition-all duration-200
                  ${isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-ink-600 hover:bg-gray-50 hover:text-brand-600'
                  }
                `}
              >
                <Icon
                  name={item.icon}
                  size={20}
                  className={`flex-shrink-0 mt-0.5 ${isActive ? 'text-brand-600' : 'text-ink-400'}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-brand-700' : 'text-ink-700'}`}>
                    {item.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${isActive ? 'text-brand-600' : 'text-ink-500'}`}>
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-3">
          Quick Stats
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-600">Total Adventures</span>
            <span className="text-sm font-semibold text-ink-800">85+</span>
          </div>
          {geminiStats.total > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-600">Gemini Games</span>
              <span className="text-sm font-semibold text-brand-600">{geminiStats.total}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-600">Active Users</span>
            <span className="text-sm font-semibold text-ink-800">-</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 mt-auto border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center space-x-2 text-sm text-ink-600 hover:text-brand-600 transition-colors"
        >
          <Icon name="arrow-left" size={16} />
          <span>Back to Platform</span>
        </Link>
      </div>
    </aside>
  );
}
