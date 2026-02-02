import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'candy'
    | 'outline-pop'
    | 'candy-pink'
    | 'candy-mint';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'data-analytics'?: string;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  'data-analytics': dataAnalytics,
  ...props
}: ButtonProps) {
  // Check if using Playful Geometric variant
  const isPlayfulGeometric = [
    'candy',
    'outline-pop',
    'candy-pink',
    'candy-mint',
  ].includes(variant);

  // Playful Geometric base classes
  const pgBaseClasses =
    'relative inline-flex items-center justify-center gap-2 font-bold rounded-full border-2 border-pg-border transition-all duration-200 ease-bounce disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pg-violet focus:ring-offset-2';

  // Legacy base classes
  const legacyBaseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  // Playful Geometric variant classes
  const pgVariantClasses = {
    candy:
      'bg-pg-violet text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active',
    'outline-pop':
      'bg-transparent text-foreground hover:bg-pg-yellow hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active',
    'candy-pink':
      'bg-pg-pink text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active',
    'candy-mint':
      'bg-pg-mint text-white shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover active:translate-x-0.5 active:translate-y-0.5 active:shadow-pop-active',
  };

  // Legacy variant classes
  const legacyVariantClasses = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500',
    secondary:
      'bg-white hover:bg-gray-50 text-brand-500 border-2 border-brand-500 focus:ring-brand-500',
    accent:
      'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500',
  };

  // Playful Geometric size classes (rounded pill buttons)
  const pgSizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  // Legacy size classes
  const legacySizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  if (isPlayfulGeometric) {
    return (
      <button
        className={cn(
          pgBaseClasses,
          pgVariantClasses[variant as keyof typeof pgVariantClasses],
          pgSizeClasses[size],
          className
        )}
        data-analytics={dataAnalytics}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={cn(
        legacyBaseClasses,
        legacyVariantClasses[variant as keyof typeof legacyVariantClasses],
        legacySizeClasses[size],
        className
      )}
      data-analytics={dataAnalytics}
      {...props}
    >
      {children}
    </button>
  );
}
