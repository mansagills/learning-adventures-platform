import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: ReactNode;
  size?: 'sm' | 'lg';
  className?: string;
}

export default function Container({
  children,
  size = 'lg',
  className
}: ContainerProps) {
  return (
    <div
      className={cn(
        size === 'sm' ? 'container-sm' : 'container-lg',
        className
      )}
    >
      {children}
    </div>
  );
}