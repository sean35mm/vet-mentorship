import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(spinnerVariants({ size }), className)}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

// Loading skeleton for cards and content
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('animate-pulse rounded-md bg-muted', className)}
    {...props}
  />
));
Skeleton.displayName = 'Skeleton';

// Page loading component
interface PageLoadingProps {
  message?: string;
}

const PageLoading: React.FC<PageLoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Spinner size="xl" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
};

// Card skeleton for mentor cards
const MentorCardSkeleton: React.FC = () => {
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex space-x-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
    </div>
  );
};

// List loading component
interface ListLoadingProps {
  count?: number;
  renderSkeleton?: () => React.ReactNode;
}

const ListLoading: React.FC<ListLoadingProps> = ({ 
  count = 3, 
  renderSkeleton = () => <MentorCardSkeleton /> 
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border rounded-lg">
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Button loading state
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ 
  loading = false, 
  children, 
  disabled,
  className,
  ...props 
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        'bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
};

export { 
  Spinner, 
  Skeleton, 
  PageLoading, 
  MentorCardSkeleton, 
  ListLoading, 
  LoadingButton,
  spinnerVariants 
};