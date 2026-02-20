'use client';

import Link from 'next/link';
import Icon from '../Icon';
import { analytics } from '@/lib/analytics';

interface ViewMoreButtonProps {
  category: string;
  categoryName: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function ViewMoreButton({
  category,
  categoryName,
  className = '',
  variant = 'outline',
  size = 'sm',
}: ViewMoreButtonProps) {
  const handleClick = () => {
    analytics.clickCTA(`View More ${categoryName}`, 'homepage-preview');
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-brand-500 text-white hover:bg-brand-600 border-brand-500';
      case 'secondary':
        return 'bg-accent-500 text-white hover:bg-accent-600 border-accent-500';
      case 'outline':
      default:
        return 'bg-white text-brand-600 hover:bg-brand-50 border-brand-300 hover:border-brand-400';
    }
  };

  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  return (
    <Link
      href={`/catalog?category=${category}`}
      onClick={handleClick}
      className={`
        inline-flex items-center space-x-2 rounded-lg border font-medium
        transition-all duration-200 hover:shadow-sm focus:outline-none
        focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
        ${getVariantStyles(variant)}
        ${getSizeStyles(size)}
        ${className}
      `}
    >
      <span>View All {categoryName}</span>
      <Icon name="arrow-right" size={16} />
    </Link>
  );
}
