/** Proxy calls to the existing EC2 search server at 3.147.205.68 */

const EC2_BASE = import.meta.env.VITE_EC2_BASE || '/api/ec2';

export interface SearchResult {
  name: string;
  description?: string;
  sku?: string;
  cost?: number;
  list_price?: number;
  qty_avail?: number;
  source: 'IML' | 'SecLock' | 'CRL' | 'Alarmax';
  slug?: string;
  url?: string;
}

export interface SearchResponse {
  sources: Record<string, SearchResult[]>;
  total: number;
}

export async function searchParts(
  query: string,
  sources = 'iml,seclock,crl',
  limit = 20
): Promise<SearchResponse> {
  const res = await fetch(
    `${EC2_BASE}/search?q=${encodeURIComponent(query)}&sources=${sources}&limit=${limit}`
  );
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}

export async function getSecLockNetPrice(slug: string): Promise<{ net_price: number; list_price: number } | null> {
  try {
    const res = await fetch(`${EC2_BASE}/seclock-price?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function checkHealth(): Promise<Record<string, unknown>> {
  const res = await fetch(`${EC2_BASE}/health`);
  return res.json();
}
