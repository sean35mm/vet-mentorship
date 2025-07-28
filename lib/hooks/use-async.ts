'use client';

import * as React from 'react';
import { AppError, handleApiError, logError } from '../error-handling';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: AppError | null;
}

interface AsyncOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: AppError) => void;
  retries?: number;
  retryDelay?: number;
}

export const useAsync = <T = any>(
  asyncFunction: () => Promise<T>,
  options: AsyncOptions = {}
) => {
  const {
    immediate = true,
    onSuccess,
    onError,
    retries = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = React.useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });

  const execute = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    let attempt = 0;
    const maxAttempts = retries + 1;

    while (attempt < maxAttempts) {
      try {
        const data = await asyncFunction();
        setState({ data, loading: false, error: null });
        onSuccess?.(data);
        return data;
      } catch (error) {
        attempt++;
        const appError = handleApiError(error);
        
        if (attempt >= maxAttempts) {
          setState({ data: null, loading: false, error: appError });
          logError(appError, { function: asyncFunction.name, attempt });
          onError?.(appError);
          throw appError;
        }

        // Wait before retrying
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }
    
    // This should never be reached, but TypeScript requires a return
    throw new Error('Unexpected end of retry loop');
  }, [asyncFunction, onSuccess, onError, retries, retryDelay]);

  const reset = React.useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  React.useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    ...state,
    execute,
    reset,
  };
};

export const useAsyncSubmit = <T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: AsyncOptions = {}
) => {
  const [state, setState] = React.useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const submit = React.useCallback(async (formData: any) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await submitFunction(formData);
      setState({ data: result, loading: false, error: null });
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      const appError = handleApiError(error);
      setState({ data: null, loading: false, error: appError });
      logError(appError, { formData });
      options.onError?.(appError);
      throw appError;
    }
  }, [submitFunction, options]);

  const reset = React.useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    submit,
    reset,
  };
};
