import { useState, useEffect, useRef, useMemo } from 'react';

interface UseVirtualListOptions {
  itemCount: number;
  itemHeight: number;
  overscan?: number;
}

export function useVirtualList<T extends HTMLElement>({
  itemCount,
  itemHeight,
  overscan = 3,
}: UseVirtualListOptions) {
  const containerRef = useRef<T | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(400);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      setScrollTop(el.scrollTop);
    };

    setContainerHeight(el.clientHeight || 400);
    setScrollTop(el.scrollTop || 0);

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const { startIndex, endIndex, totalHeight, offsetY } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const end = Math.min(itemCount - 1, start + visibleCount + 2 * overscan);

    return {
      startIndex: start,
      endIndex: end,
      totalHeight: itemCount * itemHeight,
      offsetY: start * itemHeight,
    };
  }, [scrollTop, containerHeight, itemCount, itemHeight, overscan]);

  return {
    containerRef,
    startIndex,
    endIndex,
    totalHeight,
    offsetY,
  };
}
