// ── useVirtualList ────────────────────────────────────────────────────────────
// Lightweight viewport-based list virtualizer. Only items whose estimated DOM
// position overlaps the scrollable container are actually rendered — the rest
// are replaced by a single blank spacer element.
//
// Usage:
//   const { containerProps, innerProps, virtualItems, totalHeight } =
//     useVirtualList({ items: myArray, itemHeight: 48, overscan: 3 });
//
//   <div {...containerProps}>
//     <div {...innerProps}>
//       {virtualItems.map(({ item, index, offsetTop }) => (
//         <div key={index} style={{ position: 'absolute', top: offsetTop, width: '100%', height: 48 }}>
//           <MyRow item={item} />
//         </div>
//       ))}
//     </div>
//   </div>

import { useCallback, useEffect, useRef, useState } from 'react';

export interface VirtualItem<T> {
  item: T;
  index: number;
  offsetTop: number;
}

interface UseVirtualListOptions<T> {
  items: T[];
  /** Fixed row height in pixels (required). */
  itemHeight: number;
  /** Number of extra rows to render above and below the visible window. Default 3. */
  overscan?: number;
}

interface UseVirtualListResult<T> {
  /** Spread onto the scrollable outer wrapper. */
  containerRef: React.RefObject<HTMLDivElement>;
  /** Total pixel height of the virtual list — set this on the inner div. */
  totalHeight: number;
  /** The subset of items currently mounted in the DOM. */
  virtualItems: VirtualItem<T>[];
}

export function useVirtualList<T>({
  items,
  itemHeight,
  overscan = 3,
}: UseVirtualListOptions<T>): UseVirtualListResult<T> {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Observe container size changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height);
    });
    ro.observe(el);
    setContainerHeight(el.clientHeight);

    return () => ro.disconnect();
  }, []);

  // Track scroll position
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const totalHeight = items.length * itemHeight;

  // Compute visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2;
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount);

  const virtualItems: VirtualItem<T>[] = [];
  for (let i = startIndex; i <= endIndex; i++) {
    virtualItems.push({ item: items[i], index: i, offsetTop: i * itemHeight });
  }

  return { containerRef, totalHeight, virtualItems };
}
