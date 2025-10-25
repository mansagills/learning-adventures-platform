'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Icon from '../Icon';
import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  iconColor?: string;
  children: ReactNode;
  action?: ReactNode | {
    label: string;
    href: string;
  };
  className?: string;
  variant?: 'default' | 'gradient' | 'outlined';
  isLoading?: boolean;
}

export default function DashboardCard({
  title,
  description,
  icon,
  iconColor = 'text-brand-600',
  children,
  action,
  className,
  variant = 'default',
  isLoading = false
}: DashboardCardProps) {
  const cardStyles = {
    default: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    gradient: 'bg-gradient-to-br from-brand-500 to-accent-500 border-none',
    outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600'
  };

  const isActionObject = action && typeof action === 'object' && 'href' in action;

  return (
    <div
      className={cn(
        'rounded-lg shadow-sm p-6',
        cardStyles[variant],
        isLoading && 'animate-pulse',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          {icon && (
            <div className="flex-shrink-0">
              {typeof icon === 'string' ? (
                <Icon name={icon} size={24} className={iconColor} />
              ) : (
                icon
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "text-lg font-bold truncate",
              variant === 'gradient' ? 'text-white' : 'text-gray-800 dark:text-gray-200'
            )}>
              {title}
            </h3>
            {description && (
              <p className={cn(
                "text-sm mt-1",
                variant === 'gradient' ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
              )}>
                {description}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="flex-shrink-0 ml-4">
            {isActionObject ? (
              <Link
                href={(action as { href: string }).href}
                className="text-sm text-brand-500 hover:text-brand-600 font-medium"
              >
                {(action as { label: string }).label}
              </Link>
            ) : (
              action
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// Metric Card Variant for displaying statistics
interface MetricCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  icon,
  trend,
  className,
  isLoading = false
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4',
        isLoading && 'animate-pulse',
        className
      )}
    >
      {isLoading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            {icon}
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            {trend && (
              <div
                className={cn(
                  'flex items-center space-x-1 text-sm font-medium',
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                <Icon
                  name={trend.direction === 'up' ? 'chevronUp' : 'chevronDown'}
                  size={16}
                />
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
