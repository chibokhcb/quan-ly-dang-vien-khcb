/**
 * Security and masking utilities for sensitive data
 */

export function maskSensitiveId(code?: string | null): string {
  if (!code) return '***';
  const str = String(code).trim();
  if (str.length <= 4) return '****';
  const lastFour = str.slice(-4);
  const stars = '*'.repeat(Math.max(str.length - 4, 8));
  return `${stars}${lastFour}`;
}

export function generateSimpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(16);
}
