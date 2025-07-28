'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'mobile';
}

export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  className,
  variant = 'default',
}) => {
  const cardClasses = cn(
    'transition-all duration-200',
    {
      // Default variant - full padding on all screens
      'p-6': variant === 'default',
      // Compact variant - reduced padding
      'p-4': variant === 'compact',
      // Mobile variant - responsive padding
      'p-3 sm:p-4 md:p-6': variant === 'mobile',
    },
    className
  );

  return (
    <Card className={cardClasses}>
      {children}
    </Card>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 6,
  className,
}) => {
  const gridClasses = cn(
    'grid',
    {
      [`grid-cols-${cols.default}`]: cols.default,
      [`sm:grid-cols-${cols.sm}`]: cols.sm,
      [`md:grid-cols-${cols.md}`]: cols.md,
      [`lg:grid-cols-${cols.lg}`]: cols.lg,
      [`xl:grid-cols-${cols.xl}`]: cols.xl,
      [`gap-${gap}`]: gap,
    },
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface MobileStackProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'sm' | 'md' | 'lg';
}

export const MobileStack: React.FC<MobileStackProps> = ({
  children,
  className,
  spacing = 'md',
}) => {
  const spacingClasses = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return (
    <div className={cn(
      'flex flex-col',
      spacingClasses[spacing],
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical' | 'responsive';
}

export const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = ({
  children,
  className,
  orientation = 'responsive',
}) => {
  const orientationClasses = {
    horizontal: 'flex flex-row space-x-2',
    vertical: 'flex flex-col space-y-2',
    responsive: 'flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2',
  };

  return (
    <div className={cn(orientationClasses[orientation], className)}>
      {children}
    </div>
  );
};

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open,
  onClose,
  children,
  title,
  className,
}) => {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 bg-background rounded-t-lg border-t',
        'max-h-[90vh] overflow-y-auto',
        'animate-in slide-in-from-bottom duration-300',
        className
      )}>
        {title && (
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              ×
            </button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

interface ResponsiveTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({
  headers,
  children,
  className,
}) => {
  return (
    <div className={cn('overflow-x-auto', className)}>
      {/* Desktop table */}
      <table className="hidden md:table w-full border-collapse">
        <thead>
          <tr className="border-b">
            {headers.map((header, index) => (
              <th key={index} className="text-left p-4 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {children}
        </tbody>
      </table>
      
      {/* Mobile cards */}
      <div className="md:hidden space-y-4">
        {children}
      </div>
    </div>
  );
};

interface HideOnMobileProps {
  children: React.ReactNode;
  breakpoint?: 'sm' | 'md' | 'lg';
}

export const HideOnMobile: React.FC<HideOnMobileProps> = ({
  children,
  breakpoint = 'md',
}) => {
  const breakpointClasses = {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
  };

  return (
    <div className={breakpointClasses[breakpoint]}>
      {children}
    </div>
  );
};

interface ShowOnMobileProps {
  children: React.ReactNode;
  breakpoint?: 'sm' | 'md' | 'lg';
}

export const ShowOnMobile: React.FC<ShowOnMobileProps> = ({
  children,
  breakpoint = 'md',
}) => {
  const breakpointClasses = {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden',
  };

  return (
    <div className={breakpointClasses[breakpoint]}>
      {children}
    </div>
  );
};
