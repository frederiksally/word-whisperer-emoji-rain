
import { useRef, useEffect } from 'react';

/**
 * Custom hook for getting the previous value of a prop or state.
 * @param value The value to track.
 * @returns The previous value.
 */
export const usePrevious = <T,>(value: T): T | undefined => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
