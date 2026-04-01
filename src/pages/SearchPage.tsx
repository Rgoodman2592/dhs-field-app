import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/ec2/search?q=${encodeURIComponent(query)}&sources=iml,seclock,crl&limit=20`);
      const data = await res.json();
      console.log('Search results:', data);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-sm font-bold text-white mb-3">Part Search</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search parts (e.g. 99EO, LCN 4041)"
          className="flex-1 bg-[#1a1d24] border border-gray-600 rounded-lg px-3 py-2.5 text-white text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-blue-600 text-white px-4 rounded-lg disabled:opacity-40"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center py-8">
        Search across IML, SecLock, CRL, and Alarmax
      </div>
    </div>
  );
}
