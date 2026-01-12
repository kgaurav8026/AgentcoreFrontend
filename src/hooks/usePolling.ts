// ============================================
// usePolling Hook - Polling for status updates
// ============================================

import { useEffect, useRef, useCallback, useState } from 'react';

export interface UsePollingOptions<T> {
  // Function to fetch data
  fetchFn: () => Promise<T>;
  // Polling interval in milliseconds
  interval?: number;
  // Condition to stop polling
  stopCondition?: (data: T) => boolean;
  // Whether polling is enabled
  enabled?: boolean;
  // Callback on successful fetch
  onSuccess?: (data: T) => void;
  // Callback on error
  onError?: (error: unknown) => void;
  // Maximum number of polls (0 = unlimited)
  maxPolls?: number;
}

export interface UsePollingReturn<T> {
  data: T | null;
  isPolling: boolean;
  error: unknown | null;
  pollCount: number;
  startPolling: () => void;
  stopPolling: () => void;
  refetch: () => Promise<void>;
}

export function usePolling<T>(options: UsePollingOptions<T>): UsePollingReturn<T> {
  const {
    fetchFn,
    interval = 3000,
    stopCondition,
    enabled = true,
    onSuccess,
    onError,
    maxPolls = 0,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  const fetch = useCallback(async () => {
    try {
      const result = await fetchFn();
      if (!isMountedRef.current) return;

      setData(result);
      setError(null);
      setPollCount((prev) => prev + 1);
      onSuccess?.(result);

      // Check stop condition
      if (stopCondition?.(result)) {
        setIsPolling(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err);
      onError?.(err);
    }
  }, [fetchFn, stopCondition, onSuccess, onError]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;

    setIsPolling(true);
    setPollCount(0);
    fetch(); // Initial fetch

    intervalRef.current = setInterval(() => {
      if (maxPolls > 0 && pollCount >= maxPolls) {
        stopPolling();
        return;
      }
      fetch();
    }, interval);
  }, [fetch, interval, maxPolls, pollCount]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetch();
  }, [fetch]);

  // Start polling on mount if enabled
  useEffect(() => {
    if (enabled) {
      startPolling();
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    isPolling,
    error,
    pollCount,
    startPolling,
    stopPolling,
    refetch,
  };
}

export default usePolling;
