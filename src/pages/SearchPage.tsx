import { useState } from 'react';
import { Search, Loader2, DollarSign, Plus, ShoppingCart } from 'lucide-react';
import { searchParts, getSecLockNetPrice, type SearchResult } from '../api/ec2Search';

const SOURCE_COLORS: Record<string, string> = {
  IML: 'bg-green-500/15 text-green-400 border-green-500/20',
  SecLock: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  CRL: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  Alarmax: 'bg-red-500/15 text-red-400 border-red-500/20',
};

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Record<string, SearchResult[]>>({});
  const [error, setError] = useState('');
  const [pricingSlug, setPricingSlug] = useState<string | null>(null);
  const [netPrices, setNetPrices] = useState<Record<string, number>>({});

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await searchParts(query.trim());
      setResults(data.sources || {});
      if (Object.values(data.sources || {}).flat().length === 0) {
        setError('No results found');
      }
    } catch (err) {
      setError('Search failed — check connection');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGetNetPrice = async (slug: string) => {
    setPricingSlug(slug);
    const price = await getSecLockNetPrice(slug);
    if (price?.net_price) {
      setNetPrices(prev => ({ ...prev, [slug]: price.net_price }));
    }
    setPricingSlug(null);
  };

  const allResults = Object.entries(results).flatMap(([source, items]) =>
    items.map(item => ({ ...item, source: source as SearchResult['source'] }))
  );

  return (
    <div className="p-4">
      <h2 className="text-sm font-bold text-white mb-3">Part Search</h2>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search parts (e.g. 99EO, LCN 4041, HES 9600)"
          className="flex-1 bg-[#1a1d24] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none"
        />
        <button onClick={handleSearch} disabled={loading || !query.trim()}
          className="bg-blue-600 text-white px-4 rounded-lg disabled:opacity-40">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </div>

      {/* Source legend */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {['IML', 'SecLock', 'CRL', 'Alarmax'].map(src => (
          <span key={src} className={`text-[9px] px-2 py-0.5 rounded-full border ${SOURCE_COLORS[src]}`}>
            {src}
          </span>
        ))}
      </div>

      {/* Error */}
      {error && <div className="text-xs text-red-400 text-center py-4">{error}</div>}

      {/* Results */}
      <div className="flex flex-col gap-2">
        {allResults.map((item, i) => (
          <div key={`${item.source}-${i}`} className="bg-[#1a1d24] rounded-xl p-3 border border-gray-700/30">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-[8px] px-1.5 py-0.5 rounded border ${SOURCE_COLORS[item.source]}`}>
                    {item.source}
                  </span>
                  {item.sku && <span className="text-[10px] text-gray-500 font-mono">{item.sku}</span>}
                </div>
                <div className="text-xs font-medium text-white truncate">{item.name}</div>
                {item.description && (
                  <div className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{item.description}</div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {item.cost && <span className="text-xs font-bold text-green-400">${item.cost.toFixed(2)}</span>}
                {item.list_price && <span className="text-[10px] text-gray-500 line-through">${item.list_price.toFixed(2)}</span>}
                {item.qty_avail !== undefined && (
                  <span className={`text-[9px] ${item.qty_avail > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {item.qty_avail > 0 ? `${item.qty_avail} in stock` : 'Out of stock'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {item.source === 'SecLock' && item.slug && (
                <button
                  onClick={() => handleGetNetPrice(item.slug!)}
                  disabled={pricingSlug === item.slug}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 bg-blue-600/20 text-blue-400 rounded border border-blue-500/20"
                >
                  {pricingSlug === item.slug ? <Loader2 size={10} className="animate-spin" /> : <DollarSign size={10} />}
                  {netPrices[item.slug!] ? `Net: $${netPrices[item.slug!].toFixed(2)}` : 'Get Net Price'}
                </button>
              )}
              <button className="flex items-center gap-1 text-[10px] px-2 py-1 bg-green-600/20 text-green-400 rounded border border-green-500/20 ml-auto">
                <Plus size={10} /> Add to Estimate
              </button>
            </div>
          </div>
        ))}
      </div>

      {allResults.length === 0 && !loading && !error && (
        <div className="text-xs text-gray-500 text-center py-12">
          Search across IML (97K items), SecLock, CRL, and Alarmax
        </div>
      )}
    </div>
  );
}
