import { useState, useEffect, useCallback, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

interface UseInfiniteScrollReturn {
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  setHasMore: (hasMore: boolean) => void;
  setLoading: (loading: boolean) => void;
  loadingRef: React.RefObject<HTMLDivElement | null>;
}

export const useInfiniteScroll = (
  onLoadMore: () => Promise<void> | void,
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollReturn => {
  const { threshold = 0.1, rootMargin = '100px', enabled = true } = options;
  
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    try {
      await onLoadMore();
    } catch (error) {
      console.error('Error loading more content:', error);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, onLoadMore]);

  useEffect(() => {
    if (!enabled || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, hasMore, loading, threshold, rootMargin, loadMore]);

  return {
    loading,
    hasMore,
    loadMore,
    setHasMore,
    setLoading,
    loadingRef
  };
};
