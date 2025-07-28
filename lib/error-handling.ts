// Error types for the application
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError extends Error {
  type: ErrorType;
  code?: string;
  statusCode?: number;
  details?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  requestId?: string;
}

// Create typed errors
export class NetworkError extends Error implements AppError {
  type = ErrorType.NETWORK as const;
  timestamp = new Date();
  statusCode?: number;
  details?: Record<string, any>;
  userId?: string;
  requestId?: string;

  constructor(message: string, statusCode?: number, details?: Record<string, any>) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends Error implements AppError {
  type = ErrorType.VALIDATION as const;
  timestamp = new Date();
  code?: string;
  details?: Record<string, any>;
  userId?: string;
  requestId?: string;

  constructor(message: string, code?: string, details?: Record<string, any>) {
    super(message);
    this.name = 'ValidationError';
    this.code = code;
    this.details = details;
  }
}

export class AuthenticationError extends Error implements AppError {
  type = ErrorType.AUTHENTICATION as const;
  timestamp = new Date();
  statusCode = 401;
  details?: Record<string, any>;
  userId?: string;
  requestId?: string;

  constructor(message: string = 'Authentication required', details?: Record<string, any>) {
    super(message);
    this.name = 'AuthenticationError';
    this.details = details;
  }
}

export class AuthorizationError extends Error implements AppError {
  type = ErrorType.AUTHORIZATION as const;
  timestamp = new Date();
  statusCode = 403;
  details?: Record<string, any>;
  userId?: string;
  requestId?: string;

  constructor(message: string = 'Access denied', details?: Record<string, any>) {
    super(message);
    this.name = 'AuthorizationError';
    this.details = details;
  }
}

export class NotFoundError extends Error implements AppError {
  type = ErrorType.NOT_FOUND as const;
  timestamp = new Date();
  statusCode = 404;
  details?: Record<string, any>;
  userId?: string;
  requestId?: string;

  constructor(message: string = 'Resource not found', details?: Record<string, any>) {
    super(message);
    this.name = 'NotFoundError';
    this.details = details;
  }
}

// Error handling utilities
export const isAppError = (error: any): error is AppError => {
  return error && typeof error === 'object' && 'type' in error && 'timestamp' in error;
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
};

export const getErrorType = (error: unknown): ErrorType => {
  if (isAppError(error)) {
    return error.type;
  }
  if (error instanceof Error) {
    // Try to infer error type from common error patterns
    const message = error.message.toLowerCase();
    if (message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK;
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('access denied')) {
      return ErrorType.AUTHORIZATION;
    }
    if (message.includes('not found')) {
      return ErrorType.NOT_FOUND;
    }
  }
  return ErrorType.UNKNOWN;
};

// Error logging utility
export const logError = (error: unknown, context?: Record<string, any>) => {
  const errorInfo = {
    message: getErrorMessage(error),
    type: getErrorType(error),
    timestamp: new Date().toISOString(),
    context,
    stack: error instanceof Error ? error.stack : undefined,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.error('Error logged:', errorInfo);
  }

  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Send to your error reporting service (e.g., Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  return errorInfo;
};

// Retry utility for failed operations
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  backoff: number = 2
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(backoff, attempt - 1)));
    }
  }
  
  throw lastError!;
};

// Safe async operation wrapper
export const safeAsync = async <T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<{ data?: T; error?: AppError }> => {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = isAppError(error) ? error : new NetworkError(getErrorMessage(error));
    logError(appError);
    
    if (fallback !== undefined) {
      return { data: fallback, error: appError };
    }
    
    return { error: appError };
  }
};

// Error recovery strategies
export const getErrorRecoveryAction = (error: AppError): {
  action: 'retry' | 'redirect' | 'refresh' | 'contact_support' | 'none';
  message: string;
  actionLabel?: string;
} => {
  switch (error.type) {
    case ErrorType.NETWORK:
      return {
        action: 'retry',
        message: 'Network connection issue. Please check your internet connection and try again.',
        actionLabel: 'Retry',
      };
    
    case ErrorType.AUTHENTICATION:
      return {
        action: 'redirect',
        message: 'Your session has expired. Please sign in again.',
        actionLabel: 'Sign In',
      };
    
    case ErrorType.AUTHORIZATION:
      return {
        action: 'redirect',
        message: 'You don\'t have permission to access this resource.',
        actionLabel: 'Go Back',
      };
    
    case ErrorType.NOT_FOUND:
      return {
        action: 'redirect',
        message: 'The requested resource could not be found.',
        actionLabel: 'Go Home',
      };
    
    case ErrorType.VALIDATION:
      return {
        action: 'none',
        message: 'Please check your input and try again.',
      };
    
    case ErrorType.SERVER:
      return {
        action: 'contact_support',
        message: 'We\'re experiencing technical difficulties. Please try again later.',
        actionLabel: 'Contact Support',
      };
    
    default:
      return {
        action: 'refresh',
        message: 'Something went wrong. Please refresh the page and try again.',
        actionLabel: 'Refresh',
      };
  }
};

// Form error handling
export const getFieldError = (errors: Record<string, any>, fieldName: string): string | undefined => {
  const error = errors[fieldName];
  if (!error) return undefined;
  
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (Array.isArray(error) && error.length > 0) return error[0];
  
  return 'Invalid input';
};

// API error handling
export const handleApiError = (error: any): AppError => {
  if (isAppError(error)) {
    return error;
  }

  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError('Unable to connect to the server. Please check your internet connection.');
  }

  // Handle HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return new ValidationError('Invalid request. Please check your input.');
      case 401:
        return new AuthenticationError('Authentication required. Please sign in.');
      case 403:
        return new AuthorizationError('Access denied. You don\'t have permission to perform this action.');
      case 404:
        return new NotFoundError('The requested resource was not found.');
      case 429:
        return new NetworkError('Too many requests. Please wait a moment and try again.');
      case 500:
      case 502:
      case 503:
      case 504:
        return new NetworkError('Server error. Please try again later.', error.status);
      default:
        return new NetworkError(`Request failed with status ${error.status}`, error.status);
    }
  }

  // Handle Convex errors
  if (error.data && error.data.message) {
    return new ValidationError(error.data.message);
  }

  // Fallback
  return new NetworkError(getErrorMessage(error));
};
