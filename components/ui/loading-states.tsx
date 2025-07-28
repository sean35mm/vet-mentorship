'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader } from './card';
import { Loader2, Users, Calendar, MessageSquare, Star } from 'lucide-react';

// Generic loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2 className={cn(
      'animate-spin text-primary',
      sizeClasses[size],
      className
    )} />
  );
};

// Full page loading
interface PageLoadingProps {
  message?: string;
  className?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({ 
  message = 'Loading...', 
  className 
}) => (
  <div className={cn(
    'min-h-screen flex flex-col items-center justify-center p-4',
    className
  )}>
    <LoadingSpinner size="lg" className="mb-4" />
    <p className="text-muted-foreground">{message}</p>
  </div>
);

// Card loading skeleton
interface CardSkeletonProps {
  className?: string;
  showHeader?: boolean;
  lines?: number;
}

export const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  className, 
  showHeader = true, 
  lines = 3 
}) => (
  <Card className={cn('animate-pulse', className)}>
    {showHeader && (
      <CardHeader>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
    )}
    <CardContent className={showHeader ? '' : 'pt-6'}>
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Mentor card skeleton
export const MentorCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('animate-pulse', className)}>
    <CardContent className="p-6">
      <div className="flex items-start space-x-4">
        {/* Avatar skeleton */}
        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
        
        <div className="flex-1 min-w-0">
          {/* Header skeleton */}
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-48"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>

          {/* Info row skeleton */}
          <div className="flex items-center gap-6 mb-3">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-28"></div>
          </div>

          {/* Bio skeleton */}
          <div className="space-y-2 mb-3">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Tags and buttons skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-18"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
              <div className="h-8 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

// Dashboard stats skeleton
export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={cn('animate-pulse', className)}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded"></div>
      </div>
    </CardContent>
  </Card>
);

// Table skeleton
interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ 
  rows = 5, 
  columns = 4, 
  className 
}) => (
  <div className={cn('animate-pulse', className)}>
    {/* Header */}
    <div className="flex border-b pb-4 mb-4">
      {Array.from({ length: columns }).map((_, i) => (
        <div key={i} className="flex-1 px-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
    
    {/* Rows */}
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1 px-4">
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton: React.FC<{ 
  height?: number; 
  className?: string;
  type?: 'line' | 'bar' | 'pie';
}> = ({ 
  height = 300, 
  className,
  type = 'line'
}) => (
  <div className={cn('animate-pulse', className)} style={{ height }}>
    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading chart...</div>
    </div>
  </div>
);

// List skeleton
interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  className?: string;
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ 
  items = 5, 
  showAvatar = true, 
  className 
}) => (
  <div className={cn('animate-pulse space-y-4', className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
        {showAvatar && (
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
        )}
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    ))}
  </div>
);

// Loading overlay
interface LoadingOverlayProps {
  show: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  show, 
  message = 'Loading...', 
  className 
}) => {
  if (!show) return null;

  return (
    <div className={cn(
      'absolute inset-0 bg-white/80 backdrop-blur-sm',
      'flex items-center justify-center z-50',
      className
    )}>
      <div className="text-center">
        <LoadingSpinner size="lg" className="mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

// Button loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  loading = false, 
  children, 
  loadingText,
  className,
  disabled,
  ...props 
}) => (
  <button
    {...props}
    disabled={loading || disabled}
    className={cn(
      'inline-flex items-center justify-center',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
  >
    {loading && <LoadingSpinner size="sm" className="mr-2" />}
    {loading && loadingText ? loadingText : children}
  </button>
);

// Suspense fallback components
export const SuspenseFallback: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <LoadingSpinner size="lg" className="mb-2" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);

// Dashboard loading state
export const DashboardLoading: React.FC = () => (
  <div className="space-y-8">
    {/* Stats cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </CardHeader>
        <CardContent>
          <ChartSkeleton height={300} />
        </CardContent>
      </Card>
      
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-56"></div>
        </CardHeader>
        <CardContent>
          <ChartSkeleton height={300} type="pie" />
        </CardContent>
      </Card>
    </div>

    {/* Lists */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <CardSkeleton showHeader={true} lines={5} />
      <CardSkeleton showHeader={true} lines={5} />
    </div>
  </div>
);
