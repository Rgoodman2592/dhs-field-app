export const FINISHES: Record<string, string> = {
  '626': 'US26D Satin Chrome',
  '628': 'US28 Satin Aluminum',
  '630': 'US32D Satin Stainless',
  '605': 'US3 Bright Brass',
  '613': 'US10B Oil Rubbed Bronze',
  '710': 'Dark Bronze Anodized',
  '689': 'Painted Aluminum',
};

export function getFinishName(code: string): string {
  return FINISHES[code] ?? code;
}
