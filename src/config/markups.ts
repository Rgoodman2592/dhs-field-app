/** Category-specific markup percentages (over dealer cost) */
export const CATEGORY_MARKUPS: Record<string, number> = {
  'Exit Devices': 40,
  'Door Closers': 40,
  'Electric Strikes': 40,
  'Maglocks': 40,
  'Commercial Locks': 40,
  'Hinges': 35,
  'Door Accessories': 35,
  'Access Control': 45,
  'Cylinders': 40,
  'Frames & Doors': 35,
  'Glass/Storefront': 40,
  'Auto Operators': 35,
  'Cameras': 45,
};

export function getMarkup(category: string): number {
  return CATEGORY_MARKUPS[category] ?? 40;
}

export function applyMarkup(cost: number, category: string): number {
  const mk = getMarkup(category);
  return Math.round(cost * (1 + mk / 100) * 100) / 100;
}
