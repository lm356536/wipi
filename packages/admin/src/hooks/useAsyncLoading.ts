import { useState, useCallback, useEffect, useRef } from 'react';

type PromiseAction = (...args: any[]) => Promise<any>;

export function useAsyncLoading<A extends PromiseAction>(action: A, wait = 200): [A, boolean] {
  const timerRef = useRef(null);
  const [pending, setPending] = useState(false);
  const [loading, setLoading] = useState(false);

  const actionWithPending = useCallback(
    (...args: Parameters<A>) => {
      setPending(true);
      const promise = action(...args);
      promise.then(
        () => setPending(false),
        () => setPending(false)
      );
      return promise;
    },
    [action]
  );

  useEffect(() => {
    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setLoading(pending);
    }, wait);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [wait, pending]);

  return [actionWithPending as A, loading];
}
