import { useState, useCallback, useRef } from 'react';
import { Node } from 'reactflow';
import { GraphNodeData } from '../types/graph';

export function useGraphSearch(nodes: Node<GraphNodeData>[]) {
  const [query, setQuery] = useState('');
  const [matchedId, setMatchedId] = useState<string | null>(null);
  const zoomRef = useRef<((id: string) => void) | null>(null);

  const search = useCallback((q: string, zoomTo?: (id: string) => void) => {
    setQuery(q);
    if (!q.trim()) {
      setMatchedId(null);
      return;
    }

    const lower = q.toLowerCase();
    // Fuzzy: find closest match
    const match = nodes.find(n =>
      n.data.label?.toLowerCase().includes(lower) ||
      n.data.file?.toLowerCase().includes(lower)
    );

    if (match) {
      setMatchedId(match.id);
      if (zoomTo) zoomTo(match.id);
      else if (zoomRef.current) zoomRef.current(match.id);
    } else {
      setMatchedId(null);
    }
  }, [nodes]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setMatchedId(null);
  }, []);

  return { query, matchedId, search, clearSearch, setZoomFn: (fn: (id: string) => void) => { zoomRef.current = fn; } };
}
