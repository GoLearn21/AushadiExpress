/** WCAG 2.2 relative luminance and contrast ratio, dependency-free. Mirrors the Kotlin Contrast object. */
const lin = (c: number) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
export function luminance(hex: string): number {
  const h = hex.replace("#", ""); const n = parseInt(h, 16);
  return 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
}
export function ratio(fg: string, bg: string): number {
  const a = luminance(fg), b = luminance(bg); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
