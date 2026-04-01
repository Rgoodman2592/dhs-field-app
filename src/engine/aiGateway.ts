/**
 * AI Gateway — Claude API fallback for issue classification.
 * ONLY called when rule-based classifier confidence < 0.6.
 *
 * Cost controls:
 * - Max 50 calls/day (hard limit)
 * - Response caching by normalized description
 * - Constrained JSON output (~700 tokens per call)
 * - No AI for: pricing, markup, fire code, style, vendor search
 */

const DAILY_LIMIT = 50;
const CACHE_KEY = 'dhs_ai_cache';
const COUNT_KEY = 'dhs_ai_daily_count';

interface AIClassification {
  category: string;
  confidence: number;
  productId?: string;
  cached: boolean;
}

/** Normalize description for cache key */
function normalize(desc: string): string {
  return desc.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

/** Get cached classification */
function getCached(desc: string): AIClassification | null {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    const key = normalize(desc);
    if (cache[key]) {
      return { ...cache[key], cached: true };
    }
  } catch { /* ignore */ }
  return null;
}

/** Save to cache */
function saveToCache(desc: string, result: AIClassification) {
  try {
    const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    cache[normalize(desc)] = { category: result.category, confidence: result.confidence, productId: result.productId };
    // Keep cache under 500 entries
    const keys = Object.keys(cache);
    if (keys.length > 500) {
      for (const k of keys.slice(0, keys.length - 500)) delete cache[k];
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch { /* ignore */ }
}

/** Check and increment daily counter */
function checkDailyLimit(): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem(COUNT_KEY) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    if (stored.date !== today) {
      localStorage.setItem(COUNT_KEY, JSON.stringify({ date: today, count: 0 }));
      return true;
    }
    return (stored.count || 0) < DAILY_LIMIT;
  } catch {
    return true;
  }
}

function incrementDailyCount() {
  try {
    const stored = JSON.parse(localStorage.getItem(COUNT_KEY) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    const count = stored.date === today ? (stored.count || 0) + 1 : 1;
    localStorage.setItem(COUNT_KEY, JSON.stringify({ date: today, count }));
  } catch { /* ignore */ }
}

const CATEGORIES = [
  'Exit Devices', 'Door Closers', 'Commercial Locks', 'Hinges',
  'Frames & Doors', 'Electric Strikes', 'Maglocks', 'Access Control',
  'Cameras', 'Auto Operators', 'Cylinders', 'Door Accessories',
  'Glass/Storefront',
];

/**
 * Classify an issue using Claude API. Only call when rule-based confidence < 0.6.
 * Returns cached result if available.
 */
export async function classifyWithAI(description: string): Promise<AIClassification> {
  // 1. Check cache
  const cached = getCached(description);
  if (cached) return cached;

  // 2. Check daily limit
  if (!checkDailyLimit()) {
    return {
      category: 'Door Accessories',
      confidence: 0.3,
      cached: false,
    };
  }

  // 3. Call API (via Vercel serverless function to keep key server-side)
  try {
    const apiBase = import.meta.env.VITE_API_BASE || '';
    const res = await fetch(`${apiBase}/api/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        categories: CATEGORIES,
      }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json();
    incrementDailyCount();

    const result: AIClassification = {
      category: data.category || 'Door Accessories',
      confidence: data.confidence || 0.7,
      productId: data.productId,
      cached: false,
    };

    saveToCache(description, result);
    return result;
  } catch (err) {
    console.warn('AI classification failed, using fallback:', err);
    return {
      category: 'Door Accessories',
      confidence: 0.3,
      cached: false,
    };
  }
}

/** Get daily AI usage stats */
export function getAIUsageStats(): { today: number; limit: number } {
  try {
    const stored = JSON.parse(localStorage.getItem(COUNT_KEY) || '{}');
    const today = new Date().toISOString().slice(0, 10);
    return {
      today: stored.date === today ? (stored.count || 0) : 0,
      limit: DAILY_LIMIT,
    };
  } catch {
    return { today: 0, limit: DAILY_LIMIT };
  }
}
