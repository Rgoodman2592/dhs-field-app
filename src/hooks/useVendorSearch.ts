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
  vendor?: string;
  category?: string;
}

/**
 * IMLSS uses manufacturer prefixes in item_ids:
 *   VON99EO-626-36 = Von Duprin 99EO
 *   LCN4041-CYLDEL-RW/PA-AL = LCN 4041
 *   SCH = Schlage, HES = HES, IVE = Ives, FAL = Falcon
 *   AR = Adams Rite, SAR = Sargent, CR = Corbin Russwin
 *   NOR = Norton, YAL = Yale
 *
 * SecLock uses standard model numbers without prefixes.
 *
 * The EC2 search server handles fuzzy matching and keyword indexing,
 * but we need to build smart queries that account for these conventions.
 */

/** Map brand catalog IDs to IMLSS prefixes and search-friendly names */
const IMLSS_PREFIX_MAP: Record<string, { prefix: string; searchName: string }> = {
  // Allegion brands
  'von_duprin':      { prefix: 'VON', searchName: 'Von Duprin' },
  'schlage':         { prefix: 'SCH', searchName: 'Schlage' },
  'lcn':             { prefix: 'LCN', searchName: 'LCN' },
  'ives':            { prefix: 'IVE', searchName: 'Ives' },
  'falcon':          { prefix: 'FAL', searchName: 'Falcon' },
  'glynn_johnson':   { prefix: 'GJ',  searchName: 'Glynn-Johnson' },
  // ASSA ABLOY brands
  'hes':             { prefix: 'HES', searchName: 'HES' },
  'norton':          { prefix: 'NOR', searchName: 'Norton' },
  'yale':            { prefix: 'YAL', searchName: 'Yale' },
  'sargent':         { prefix: 'SAR', searchName: 'Sargent' },
  'corbin_russwin':  { prefix: 'CR',  searchName: 'Corbin Russwin' },
  'adams_rite':      { prefix: 'AR',  searchName: 'Adams Rite' },
  'securitron':      { prefix: 'SEC', searchName: 'Securitron' },
  // dormakaba
  'dorma':           { prefix: 'DOR', searchName: 'Dorma' },
  'kaba':            { prefix: 'KAB', searchName: 'Kaba' },
  'best':            { prefix: 'BES', searchName: 'Best' },
  // Stanley
  'stanley':         { prefix: 'STN', searchName: 'Stanley' },
  // Others
  'sdc':             { prefix: 'SDC', searchName: 'SDC' },
  'detex':           { prefix: 'DET', searchName: 'Detex' },
  'alarm_controls':  { prefix: 'ALC', searchName: 'Alarm Controls' },
  'dci':             { prefix: 'DCI', searchName: 'DCI' },
  'rixson':          { prefix: 'RIX', searchName: 'Rixson' },
  'pemko':           { prefix: 'PEM', searchName: 'Pemko' },
  'ngp':             { prefix: 'NGP', searchName: 'NGP' },
  'hager':           { prefix: 'HAG', searchName: 'Hager' },
};

/** Map hardware type IDs to IMLSS category search terms */
const HARDWARE_TYPE_SEARCH: Record<string, string> = {
  door_closer:       'door closer',
  exit_device:       'exit device',
  cylindrical_lock:  'cylindrical lock',
  mortise_lock:      'mortise lock',
  deadbolt:          'deadbolt',
  hinge:             'hinge',
  continuous_hinge:  'continuous hinge',
  pivot:             'pivot',
  electric_strike:   'electric strike',
  maglock:           'electromagnetic lock maglock',
  card_reader:       'card reader proximity',
  power_supply:      'power supply',
  rex_sensor:        'request exit sensor',
  door_contact:      'door contact',
  electronic_lock:   'electronic lock',
  threshold:         'threshold',
  gasket:            'weatherstrip gasket seal',
  door_bottom:       'door bottom sweep',
  flush_bolt:        'flush bolt',
  coordinator:       'coordinator',
  stop:              'door stop',
  kickplate:         'kick plate',
  push_pull:         'push pull',
  cylinder:          'cylinder',
  auto_operator:     'automatic operator',
  hollow_metal_door: 'hollow metal door',
  hollow_metal_frame:'hollow metal frame',
  glazing:           'lite kit glazing',
};

export interface VendorSearchInput {
  manufacturer?: string;   // brand catalog ID (e.g. 'lcn', 'von_duprin')
  partNumber?: string;     // user-entered part/model (e.g. '4041', '99EO')
  hardwareType?: string;   // hardware type ID (e.g. 'door_closer')
}

/**
 * Build optimized search queries for IMLSS and SecLock.
 * Returns up to 2 query variants to maximize hit rate.
 */
function buildSearchQueries(input: VendorSearchInput): string[] {
  const { manufacturer, partNumber, hardwareType } = input;
  const queries: string[] = [];

  const mfrInfo = manufacturer ? IMLSS_PREFIX_MAP[manufacturer] : null;
  const hwSearch = hardwareType ? HARDWARE_TYPE_SEARCH[hardwareType] : null;

  if (partNumber) {
    // Has a part number — build prefixed and plain queries

    // Query 1: IMLSS-style with prefix (e.g. "VON99EO" or "LCN4041")
    if (mfrInfo) {
      const cleanPart = partNumber.replace(/[\s-]/g, '');
      queries.push(`${mfrInfo.prefix}${cleanPart}`);
    }

    // Query 2: Manufacturer name + part number (works for both IMLSS keyword search and SecLock)
    if (mfrInfo) {
      queries.push(`${mfrInfo.searchName} ${partNumber}`);
    } else {
      // No known manufacturer — search part number directly
      queries.push(partNumber);
    }
  } else if (manufacturer && hwSearch) {
    // No part number — search by manufacturer + hardware type
    // e.g. "LCN door closer" or "Von Duprin exit device"
    if (mfrInfo) {
      queries.push(`${mfrInfo.searchName} ${hwSearch}`);
    }
  } else if (manufacturer && mfrInfo) {
    // Just manufacturer, no part type
    queries.push(mfrInfo.searchName);
  } else if (hwSearch) {
    // Just hardware type
    queries.push(hwSearch);
  }

  return queries;
}

/**
 * Debounced search against IMLSS + SecLock via EC2 search server.
 * Handles IMLSS prefix conventions and manufacturer-only searches.
 */
export function useVendorSearch(input: VendorSearchInput) {
  const [results, setResults] = useState<VendorMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Serialize input for useEffect dependency
  const inputKey = `${input.manufacturer}|${input.partNumber}|${input.hardwareType}`;

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const queries = buildSearchQueries(input);
    if (queries.length === 0) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);

    timerRef.current = setTimeout(async () => {
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      try {
        // Run all query variants in parallel, merge and dedupe results
        const allResults = await Promise.all(
          queries.map(q => searchParts(q, 'iml,seclock', 10).catch(() => null))
        );

        const seen = new Set<string>();
        const matches: VendorMatch[] = [];

        for (const data of allResults) {
          if (!data?.sources) continue;
          for (const [source, items] of Object.entries(data.sources)) {
            for (const item of (items as SearchResult[])) {
              const key = `${source}:${item.sku || item.name}`;
              if (seen.has(key)) continue;
              seen.add(key);

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
        }

        // Sort: in-stock items first, then by cost (cheapest first), then items with pricing before those without
        matches.sort((a, b) => {
          // In stock first
          const aStock = (a.qtyAvail ?? 0) > 0 ? 1 : 0;
          const bStock = (b.qtyAvail ?? 0) > 0 ? 1 : 0;
          if (aStock !== bStock) return bStock - aStock;

          // Has price first
          const aPrice = a.cost ?? a.listPrice;
          const bPrice = b.cost ?? b.listPrice;
          if (aPrice && !bPrice) return -1;
          if (!aPrice && bPrice) return 1;

          // Cheaper first
          if (aPrice && bPrice) return aPrice - bPrice;
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
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [inputKey]);

  return { results, loading, error };
}
