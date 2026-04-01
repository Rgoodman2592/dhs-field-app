/**
 * Part Matcher — Given a classified issue, find the best matching product
 * from the product database with value engineering alternatives.
 */
import { ALL_PRODUCTS, pickProduct, findByCategory, type Product } from '../data/productDB';
import { getMarkup, applyMarkup } from '../config/markups';
import type { VEAlternative } from '../types';

export interface MatchResult {
  product: Product;
  sellPrice: number;
  markupPct: number;
  veAlternatives: VEAlternative[];
}

/**
 * Match a classified issue to the best product.
 * Pure rule-based — no AI needed.
 */
export function matchIssueToProduct(
  category: string,
  opts: {
    fireRated?: boolean;
    preferBudget?: boolean;
    isPair?: boolean;
    barcodeScan?: string;
  } = {}
): MatchResult | null {
  const { fireRated = false, preferBudget = false, barcodeScan } = opts;

  // 1. Try barcode/SKU match first
  if (barcodeScan) {
    const skuMatch = matchBySKU(barcodeScan);
    if (skuMatch) return buildResult(skuMatch, category);
  }

  // 2. Pick from product DB by category + tier
  const product = pickProduct(category, preferBudget, fireRated);
  if (!product) return null;

  return buildResult(product, category);
}

/** Match by scanned barcode/SKU pattern */
function matchBySKU(sku: string): Product | undefined {
  const upper = sku.toUpperCase().replace(/[\s-]/g, '');

  // Von Duprin patterns
  if (/^VON|^99EO|^98|^33A/.test(upper)) {
    return ALL_PRODUCTS.find(p => p.id === 'vondup99eo');
  }
  // LCN patterns
  if (/^LCN|^4040|^4041|^1461/.test(upper)) {
    if (upper.includes('4040')) return ALL_PRODUCTS.find(p => p.id === 'lcn4040xp');
    if (upper.includes('4041')) return ALL_PRODUCTS.find(p => p.id === 'lcn4041');
    if (upper.includes('1461')) return ALL_PRODUCTS.find(p => p.id === 'lcn1461');
    return ALL_PRODUCTS.find(p => p.id === 'lcn4041');
  }
  // Schlage patterns
  if (/^SCH|^ND\d|^ALX/.test(upper)) {
    if (upper.includes('ND')) return ALL_PRODUCTS.find(p => p.id === 'schnd80pd');
    if (upper.includes('ALX')) return ALL_PRODUCTS.find(p => p.id === 'schalx80pd');
    return ALL_PRODUCTS.find(p => p.id === 'schnd80pd');
  }
  // HES patterns
  if (/^HES|^9600|^9400/.test(upper)) {
    if (upper.includes('9400')) return ALL_PRODUCTS.find(p => p.id === 'hes9400');
    return ALL_PRODUCTS.find(p => p.id === 'hes9600');
  }
  // PDK patterns
  if (/^PDK/.test(upper)) {
    return ALL_PRODUCTS.find(p => p.id === 'pdk-cn');
  }

  // Fuzzy: search ALL_PRODUCTS by name similarity
  const match = ALL_PRODUCTS.find(p =>
    p.name.toUpperCase().replace(/[\s-]/g, '').includes(upper.slice(0, 6))
  );
  return match;
}

/** Build a full match result with VE alternatives */
function buildResult(product: Product, category: string): MatchResult {
  const mkPct = getMarkup(product.cat || category);
  const sellPrice = applyMarkup(product.cost, product.cat || category);

  // Find VE alternatives: same category, different tier
  const alternatives = findByCategory(product.cat || category)
    .filter(p => p.id !== product.id && p.tier !== product.tier)
    .map(alt => {
      const altSell = applyMarkup(alt.cost, alt.cat || category);
      const savingsPct = sellPrice > 0
        ? Math.round(((sellPrice - altSell) / sellPrice) * 100)
        : 0;
      return {
        brand: alt.name,
        partNumber: alt.id,
        unitCost: alt.cost,
        sellPrice: altSell,
        savingsPct,
      } satisfies VEAlternative;
    })
    .sort((a, b) => a.sellPrice - b.sellPrice);

  return {
    product,
    sellPrice,
    markupPct: mkPct,
    veAlternatives: alternatives,
  };
}

/**
 * Estimate labor hours for an issue based on matched product and action.
 */
export function estimateLabor(
  product: Product,
  action: string,
  doorCount: number = 1
): number {
  let hours = product.labor * doorCount;

  // Adjust for action type
  switch (action) {
    case 'repair':
      hours = Math.max(0.5, hours * 0.5); // Repair is ~half of replace
      break;
    case 'adjust':
      hours = Math.max(0.25, hours * 0.25); // Adjust is quick
      break;
    case 'install_new':
      hours = hours * 1.25; // New install adds prep time
      break;
    // 'replace' uses base labor
  }

  // Round to nearest 0.25
  return Math.round(hours * 4) / 4;
}
