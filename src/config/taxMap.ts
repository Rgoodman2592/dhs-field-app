/** State-based tax rate mapping for Service Fusion */
export const TAX_MAP: Record<string, { name: string; rate: number }> = {
  DC: { name: 'DC Sales Tax', rate: 6 },
  MD: { name: 'DC Sales Tax', rate: 6 },
  VA: { name: 'DC Sales Tax', rate: 6 },
  CA: { name: 'California Sales Tax', rate: 7.25 },
  FL: { name: 'FL Sales Tax', rate: 6 },
};

export function getTaxForState(state: string): { name: string; rate: number } {
  return TAX_MAP[state.toUpperCase()] ?? { name: 'DC Sales Tax', rate: 6 };
}

export function extractState(address: string): string | null {
  const m = address.match(/,\s*([A-Z]{2})\s*\d{5}/);
  return m ? m[1] : null;
}
