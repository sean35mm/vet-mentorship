import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const toastVariants = cva(
  'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all',
  {
    variants: {
      variant: {
        default: 'border bg-background text-foreground',
        destructive: 'destructive border-destructive bg-destructive text-destructive-foreground',
        success: 'border-green-500 bg-green-50 text-green-900',
        warning: 'border-yellow-500 bg-yellow-50 text-yellow-900',
        info: 'border-blue-500 bg-blue-50 text-blue-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface ToastProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  duration?: number;
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant, title, description, action, onClose, duration = 5000, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    React.useEffect(() => {
      if (duration > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300); // Allow fade out animation
        }, duration);

        return () => clearTimeout(timer);
      }
      
      return undefined;
    }, [duration, onClose]);

    const getIcon = () => {
      switch (variant) {
        case 'success':
          return <CheckCircle className="h-5 w-5 text-green-600" />;
        case 'destructive':
          return <AlertCircle className="h-5 w-5 text-red-600" />;
        case 'warning':
          return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
        case 'info':
          return <Info className="h-5 w-5 text-blue-600" />;
        default:
          return null;
      }
    };

    if (!isVisible) return null;

    return (
      <div
        ref={ref}
        className={cn(
          toastVariants({ variant }),
          isVisible ? 'animate-slide-up' : 'animate-fade-out',
          className
        )}
        {...props}
      >
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="grid gap-1">
            {title && (
              <div className="text-sm font-semibold">{title}</div>
            )}
            {description && (
              <div className="text-sm opacity-90">{description}</div>
            )}
          </div>
        </div>
        
        {action && <div className="flex-shrink-0">{action}</div>}
        
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
Toast.displayName = 'Toast';

// Toast context and provider
interface ToastContextType {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => void;
  removeToast: (id: string) => void;
}

interface ToastType extends ToastProps {
  id: string;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = React.useState<ToastType[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 11);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({ toasts, addToast, removeToast }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast container component
const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Convenience hook for common toast types
export const useToastActions = () => {
  const { addToast } = useToast();

  return {
    success: (title: string, description?: string) =>
      addToast({ variant: 'success', title, ...(description && { description }) }),
    
    error: (title: string, description?: string) =>
      addToast({ variant: 'destructive', title, ...(description && { description }) }),
    
    warning: (title: string, description?: string) =>
      addToast({ variant: 'warning', title, ...(description && { description }) }),
    
    info: (title: string, description?: string) =>
      addToast({ variant: 'info', title, ...(description && { description }) }),
    
    default: (title: string, description?: string) =>
      addToast({ variant: 'default', title, ...(description && { description }) }),
  };
};

export { Toast, toastVariants };