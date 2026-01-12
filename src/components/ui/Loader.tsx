// ============================================
// Loader Component - Loading spinner
// ============================================

import React from 'react';

export interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  className = '',
  text,
  fullScreen = false,
}) => {
  const spinner = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Page loader variant
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex h-[50vh] items-center justify-center">
    <Loader size="lg" text={text} />
  </div>
);

// Inline loader for buttons
export const ButtonLoader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <Loader size="sm" className={`inline-block ${className}`} />
);

// Skeleton loader for content
export interface SkeletonProps {
  className?: string;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className={`animate-pulse rounded bg-gray-200 ${className}`}
        aria-hidden="true"
      />
    ))}
  </>
);

// Table skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="overflow-hidden rounded-lg border border-gray-200">
    <div className="bg-gray-50 p-4">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Card skeleton
export const CardSkeleton: React.FC = () => (
  <div className="rounded-lg border border-gray-200 bg-white p-6">
    <Skeleton className="mb-4 h-6 w-3/4" />
    <Skeleton className="mb-2 h-4 w-full" />
    <Skeleton className="mb-2 h-4 w-full" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

export default Loader;
