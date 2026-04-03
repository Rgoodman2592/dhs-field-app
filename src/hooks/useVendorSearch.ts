import { useState, useEffect, useRef } from 'react';
import { searchParts, type SearchResult } from '../api/ec2Search';

export interface VendorMatch {
  name: string;
  sku: string;
  cost: number | null;
  listPrice: number | null;
  qtyAvail: number | null;
  source: string;
  slug?: string;
}

/**
 * Debounced search against IMLSS + SecLock via EC2 search server.
 * Fires when query is >= 3 chars, after 500ms of no typing.
 */
export function useVendorSearch(query: string) {
  const [results, setResults] = useState<VendorMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Need at least 3 chars
    if (!query || query.trim().length < 3) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(async () => {
      // Abort previous request
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        const data = await searchParts(query.trim(), 'iml,seclock', 10);

        const matches: VendorMatch[] = [];

        // Flatten results from all sources
        for (const [source, items] of Object.entries(data.sources || {})) {
          for (const item of (items as SearchResult[])) {
            matches.push({
              name: item.name || item.description || '',
              sku: item.sku || '',
              cost: item.cost ?? null,
              listPrice: item.list_price ?? null,
              qtyAvail: item.qty_avail ?? null,
              source: source.toUpperCase(),
              slug: item.slug,
            });
          }
        }

        // Sort: items with cost first, then by relevance (name match)
        matches.sort((a, b) => {
          if (a.cost && !b.cost) return -1;
          if (!a.cost && b.cost) return 1;
          return 0;
        });

        setResults(matches.slice(0, 8));
        setError(null);
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Search unavailable');
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, loading, error };
}
