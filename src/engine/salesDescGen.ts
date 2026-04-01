import { getFinishName } from '../config/finishes';

/** Strip manufacturer names from descriptions per DHS style guide */
const MFR_PREFIXES = [
  'Von Duprin', 'LCN', 'Schlage', 'Arrow', 'Falcon', 'Ives', 'Stanley',
  'McKinney', 'Hager', 'Norton', 'Yale', 'Corbin Russwin', 'Sargent',
  'HES', 'SDC', 'PDK', 'ProDataKey', 'Turing', 'Pemko', 'Cal-Royal',
];

export function stripManufacturer(desc: string): string {
  let d = desc;
  for (const mfr of MFR_PREFIXES) {
    d = d.replace(new RegExp(`\\b${mfr}\\b\\s*`, 'gi'), '');
  }
  return d.replace(/\s{2,}/g, ' ').trim();
}

/** Apply DHS Title Case: capitalize first letter of each major word */
export function titleCase(s: string): string {
  const minorWords = new Set(['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'as', 'by']);
  return s.replace(/\w+/g, (word, index) => {
    if (index === 0 || !minorWords.has(word.toLowerCase())) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    return word.toLowerCase();
  });
}

/** Generate a DHS-style sales description from a product description template */
export function formatSalesDesc(
  template: string,
  opts: {
    finish?: string;
    size?: string;
    throat?: string;
    preps?: string;
    lockprep?: string;
  } = {}
): string {
  let desc = template;

  if (opts.finish) {
    desc = desc.replace(/\{finish\}/g, getFinishName(opts.finish));
  }
  if (opts.size) {
    desc = desc.replace(/\{size\}/g, opts.size);
  }
  if (opts.throat) {
    desc = desc.replace(/\{throat\}/g, opts.throat);
  }
  if (opts.preps) {
    desc = desc.replace(/\{preps\}/g, opts.preps);
  }
  if (opts.lockprep) {
    desc = desc.replace(/\{lockprep\}/g, opts.lockprep);
  }

  return desc;
}

/** Convert inches to architectural format: 36 → 3'0", 84 → 7'0" */
export function toArchSize(widthIn: number, heightIn: number): string {
  const wFt = Math.floor(widthIn / 12);
  const wIn = widthIn % 12;
  const hFt = Math.floor(heightIn / 12);
  const hIn = heightIn % 12;
  return `${wFt}'${wIn}" x ${hFt}'${hIn}"`;
}
