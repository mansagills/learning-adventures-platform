'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '../Icon';

interface NavItem {
  name: string;
  href: string;
  icon: string;
  badge?: number;
}

const navigationItems: NavItem[] = [
  {
    name: 'Progress',
    href: '/progress',
    icon: 'trophy',
  },
  {
    name: 'My Library',
    href: '/my-library',
    icon: 'bookmark',
  },
  {
    name: 'Courses',
    href: '/courses',
    icon: 'book',
  },
  {
    name: 'Games',
    href: '/games',
    icon: 'gamepad',
  },
  {
    name: 'Practice',
    href: '/practice',
    icon: 'star',
  },
  {
    name: 'Assessments',
    href: '/assessments',
    icon: 'clipboard',
  },
  {
    name: 'Tutorials',
    href: '/tutorials',
    icon: 'lightbulb',
  },
];

export default function AppSideNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden lg:flex lg:flex-col
          fixed left-0 top-16 bottom-0
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'w-16' : 'w-64'}
          z-40
        `}
      >
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon
            name={isCollapsed ? 'chevronRight' : 'chevronLeft'}
            size={14}
            className="text-gray-600"
          />
        </button>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.name}>
                  <Link
                    href={item.href as any}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? 'bg-brand-50 text-brand-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }
                      ${isCollapsed ? 'justify-center' : ''}
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <Icon
                      name={item.icon as any}
                      size={20}
                      className={isActive ? 'text-brand-600' : 'text-gray-500'}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Upgrade Banner (for free users) */}
        {!isCollapsed && (
          <div className="p-4 m-3 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg">
            <div className="text-white">
              <h3 className="font-semibold text-sm mb-1">Upgrade to Premium</h3>
              <p className="text-xs text-white/90 mb-3">
                Unlock all courses and features
              </p>
              <Link
                href={"/upgrade" as any}
                className="block w-full px-3 py-2 text-center text-sm font-medium bg-white text-brand-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <ul className="flex justify-around items-center h-16">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.name} className="flex-1">
                <Link
                  href={item.href as any}
                  className={`
                    flex flex-col items-center justify-center h-full gap-1
                    transition-colors duration-200
                    ${isActive ? 'text-brand-600' : 'text-gray-500'}
                  `}
                >
                  <Icon name={item.icon as any} size={20} />
                  <span className="text-xs font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="absolute top-1 right-1/2 translate-x-3 -translate-y-1 w-4 h-4 bg-brand-500 text-white text-xs rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <Link
              href={"/more" as any}
              className="flex flex-col items-center justify-center h-full gap-1 text-gray-500"
            >
              <Icon name="menu" size={20} />
              <span className="text-xs font-medium">More</span>
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
