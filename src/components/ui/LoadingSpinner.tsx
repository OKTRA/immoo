import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-immoo-gold/20 border-t-immoo-gold',
          sizeClasses[size]
        )}
      />
      {text && (
        <p className="mt-4 text-sm text-immoo-navy/70 dark:text-immoo-pearl/70">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
