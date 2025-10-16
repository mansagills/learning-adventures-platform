'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Icon from '../Icon';
import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  children: ReactNode;
  action?: {
    label: string;
    href: string;
  };
  className?: string;
  variant?: 'default' | 'gradient' | 'outlined';
  loading?: boolean;
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
  loading = false
}: DashboardCardProps) {
  const cardStyles = {
    default: 'bg-white border border-gray-200',
    gradient: 'bg-gradient-to-br from-brand-50 to-accent-50 border border-brand-200',
    outlined: 'bg-transparent border-2 border-gray-300'
  };

  return (
    <div
      className={cn(
        'rounded-lg shadow-sm p-6',
        cardStyles[variant],
        loading && 'animate-pulse',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          {icon && (
            <div className="flex-shrink-0">
              <Icon name={icon} size={24} className={iconColor} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-ink-800 truncate">{title}</h3>
            {description && (
              <p className="text-sm text-ink-600 mt-1">{description}</p>
            )}
          </div>
        </div>

        {action && (
          <Link
            href={action.href}
            className="flex-shrink-0 text-sm text-brand-600 hover:text-brand-700 font-medium ml-4"
          >
            {action.label}
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
  label: string;
  value: string | number;
  icon: string;
  iconColor?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  className?: string;
}

export function MetricCard({
  label,
  value,
  icon,
  iconColor = 'text-brand-600',
  trend,
  className
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 shadow-sm p-4',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={cn('p-2 bg-gray-50 rounded-lg', iconColor)}>
            <Icon name={icon} size={20} />
          </div>
          <div>
            <p className="text-sm text-ink-600">{label}</p>
            <p className="text-2xl font-bold text-ink-800 mt-1">{value}</p>
          </div>
        </div>

        {trend && (
          <div
            className={cn(
              'flex items-center space-x-1 text-sm font-medium',
              trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
            )}
          >
            <Icon
              name={trend.direction === 'up' ? 'chevron-up' : 'chevron-down'}
              size={16}
            />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
