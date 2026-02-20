'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import DashboardNav from './DashboardNav';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showNav?: boolean;
  sidebar?: boolean;
  gridColumns?: 1 | 2 | 3 | 4;
  compactMode?: boolean;
}

export default function DashboardLayout({
  children,
  title,
  description,
  showNav = true,
  sidebar = false,
  gridColumns = 1,
  compactMode = false,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      {showNav && <DashboardNav />}

      {/* Main Content Area */}
      <div
        className={cn(
          'max-w-7xl mx-auto',
          compactMode ? 'px-2 sm:px-4 lg:px-6' : 'px-4 sm:px-6 lg:px-8',
          compactMode ? 'py-4' : 'py-8'
        )}
      >
        {/* Header Section */}
        {(title || description) && (
          <div className="mb-6">
            {title && (
              <h1
                className={cn(
                  'font-bold text-ink-800',
                  compactMode ? 'text-2xl' : 'text-3xl'
                )}
              >
                {title}
              </h1>
            )}
            {description && (
              <p
                className={cn(
                  'text-ink-600',
                  compactMode ? 'text-sm mt-1' : 'mt-2'
                )}
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Content Grid */}
        {sidebar ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              {/* Sidebar content can be added as children */}
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3">{children}</main>
          </div>
        ) : (
          <main
            className={cn(
              'grid gap-6',
              gridColumns === 1 && 'grid-cols-1',
              gridColumns === 2 && 'grid-cols-1 lg:grid-cols-2',
              gridColumns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
              gridColumns === 4 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
            )}
          >
            {children}
          </main>
        )}
      </div>
    </div>
  );
}
