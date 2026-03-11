import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';

export function useUpdateSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateSearchParams = useCallback(
    (
      updates: Record<string, string | null>,
      options?: { replace?: boolean }
    ) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(updates)) {
          if (value === null) {
            next.delete(key);
          } else {
            next.set(key, value);
          }
        }
        return next;
      }, options);
    },
    [setSearchParams]
  );

  return { searchParams, updateSearchParams };
}
