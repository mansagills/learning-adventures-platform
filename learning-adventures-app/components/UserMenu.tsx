'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import Icon from './Icon';

interface UserMenuProps {
  className?: string;
}

export default function UserMenu({ className = '' }: UserMenuProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const userInitial =
    user.name?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    'U';

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut({ callbackUrl: '/' });
  };

  const menuItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: 'dashboard',
    },
    {
      label: 'My Progress',
      href: '/dashboard/progress',
      icon: 'chart',
    },
    {
      label: 'Achievements',
      href: '/dashboard/achievements',
      icon: 'trophy',
    },
    {
      label: 'Profile Settings',
      href: '/profile',
      icon: 'settings',
    },
  ];

  // Add course request menu items for PARENT and TEACHER
  if (
    user.role === 'PARENT' ||
    user.role === 'TEACHER' ||
    user.role === 'ADMIN'
  ) {
    menuItems.splice(1, 0, {
      label: 'Request Custom Course',
      href: '/course-request',
      icon: 'plus',
    });
    menuItems.splice(2, 0, {
      label: 'My Requests',
      href: '/my-requests',
      icon: 'clipboard',
    });
  }

  // Add parent-specific menu items
  if (user.role === 'PARENT') {
    menuItems.splice(1, 0, {
      label: 'Manage Children',
      href: '/parent/children',
      icon: 'users',
    });
  }

  // Add admin/teacher specific menu items based on role
  if (user.role === 'ADMIN') {
    menuItems.push(
      {
        label: 'Content Studio',
        href: '/internal',
        icon: 'upload',
      },
      {
        label: 'Analytics',
        href: '/internal/analytics',
        icon: 'chart',
      }
    );
  } else if (user.role === 'TEACHER') {
    menuItems.push({
      label: 'My Classroom',
      href: '/teacher/classroom',
      icon: 'users',
    });
  }

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-full flex items-center justify-center">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name || 'User avatar'}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-white text-sm font-medium">
              {userInitial}
            </span>
          )}
        </div>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={16}
          className="text-ink-500 hidden sm:block"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-ink-800 truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-ink-500 truncate">{user.email}</p>
            <p className="text-xs text-brand-600 font-medium mt-1">
              {user.role?.charAt(0) + user.role?.slice(1).toLowerCase()}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                onClick={() => setIsOpen(false)}
                className="flex items-center px-4 py-2 text-sm text-ink-700 hover:bg-gray-50 hover:text-brand-600 transition-colors duration-150"
              >
                <Icon
                  name={item.icon}
                  size={16}
                  className="mr-3 text-ink-400"
                />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Sign Out */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
            >
              <Icon name="logout" size={16} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
