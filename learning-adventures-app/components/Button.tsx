import { ReactNode, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
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
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500',
    secondary: 'bg-white hover:bg-gray-50 text-brand-500 border-2 border-brand-500 focus:ring-brand-500',
    accent: 'bg-accent-500 hover:bg-accent-600 text-white focus:ring-accent-500'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      data-analytics={dataAnalytics}
      {...props}
    >
      {children}
    </button>
  );
}