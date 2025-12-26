import { useCallback, useEffect, useRef, useState } from "react";

export const useBreakpoint = () => {
  const breakpoints = {
    lg: "(min-width: 1025px)",
    md: "(min-width: 769px) and (max-width: 1024px)",
    sm: "(max-width: 768px)",
  };
  const initialBreakpoint = Object.entries(breakpoints).filter(
    ([breakpoint, query]) => window.matchMedia(query).matches && breakpoint,
  )[0][0];
  const [breakpoint, setBreakpoint] = useState(initialBreakpoint);

  useEffect(() => {
    for (const [bp, query] of Object.entries(breakpoints)) {
      window
        .matchMedia(query)
        .addEventListener(
          "change",
          (query) => query.matches && setBreakpoint(bp),
        );
    }
  }, []);

  return breakpoint;
};

export const useFetchOnScroll = <T extends Element>(
  fetcher: () => void,
  hasMore: boolean,
) => {
  const ref = useRef<T | null>(null);

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
