// src/hooks/useThrottle.ts

import { useRef, useEffect, useCallback } from "react";

/**
 * Custom hook to throttle a function.
 * @param callback The function to throttle.
 * @param delay The throttling delay in milliseconds.
 * @returns A throttled version of the callback.
 */
const useThrottle = (callback: (...args: any[]) => void, delay: number) => {
  const lastCall = useRef<number>(0);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const throttledFunction = useCallback(
    (...args: any[]) => {
      const now = Date.now();

      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else if (!timeout.current) {
        const remainingTime = delay - (now - lastCall.current);
        timeout.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
          timeout.current = null;
        }, remainingTime);
      }
    },
    [callback, delay]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, []);

  return throttledFunction;
};

export default useThrottle;
