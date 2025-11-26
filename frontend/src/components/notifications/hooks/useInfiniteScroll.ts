import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  threshold?: number;
  throttleMs?: number;
}

export function useInfiniteScroll({ onLoadMore, isLoading, hasMore, threshold = 100, throttleMs = 150 }: UseInfiniteScrollOptions) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || !onLoadMore || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      onLoadMore();
    }
  }, [onLoadMore, isLoading, hasMore, threshold]);

  // Throttle scroll events
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let timeoutId: number;
    const throttledScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, throttleMs);
    };

    container.addEventListener("scroll", throttledScroll);
    return () => {
      container.removeEventListener("scroll", throttledScroll);
      clearTimeout(timeoutId);
    };
  }, [handleScroll, throttleMs]);

  return scrollContainerRef;
}
