'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Icon from '../Icon';

interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: string[]; // Optional: restrict to certain roles
}

const navItems: NavItem[] = [
  {
    label: 'Overview',
    href: '/dashboard',
    icon: 'home'
  },
  {
    label: 'My Progress',
    href: '/dashboard/progress',
    icon: 'chart'
  },
  {
    label: 'Achievements',
    href: '/dashboard/achievements',
    icon: 'trophy'
  },
  {
    label: 'Goals',
    href: '/dashboard/goals',
    icon: 'target'
  },
  {
    label: 'Saved Adventures',
    href: '/dashboard/saved',
    icon: 'bookmark'
  }
];

export default function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={cn(
                  'flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  isActive
                    ? 'border-brand-500 text-brand-600'
                    : 'border-transparent text-ink-600 hover:text-ink-800 hover:border-gray-300'
                )}
              >
                <Icon name={item.icon} size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
