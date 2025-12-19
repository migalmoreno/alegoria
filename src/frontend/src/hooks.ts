import { useCallback, useEffect, useRef } from "react";

export const useFetchOnScroll = (fetcher: () => void, hasMore: boolean) => {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const isIntersecting = entries[0]?.isIntersecting;
      if (isIntersecting && hasMore) {
        fetcher();
      }
    },
    [fetcher, hasMore],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [handleIntersection]);

  return { ref };
};
