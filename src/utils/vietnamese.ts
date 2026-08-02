/**
 * Vietnamese utility functions for QUẢN LÝ ĐẢNG VIÊN KHCB
 */

/**
 * Remove Vietnamese accents for search normalization
 */
export function removeVietnameseAccents(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

/**
 * Normalize full name into uppercase Vietnamese standard
 */
export function normalizeFullName(name: string): string {
  if (!name) return '';
  return name.trim().toUpperCase();
}

/**
 * Validate 12-digit text code (CCCD / Party Card) preserving leading zeroes
 */
export function isValid12DigitCode(code: string): boolean {
  if (!code) return false;
  return /^\d{12}$/.test(code.trim());
}

/**
 * Format ISO date string or Date object to dd/MM/yyyy
 */
export function formatDateVN(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) {
      // If it's already in dd/MM/yyyy format, return it
      if (typeof dateInput === 'string' && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateInput)) {
        return dateInput;
      }
      return String(dateInput);
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format ISO date string or Date object to dd/MM/yyyy HH:mm:ss
 */
export function formatDateTimeVN(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Case-insensitive and accent-insensitive text search helper
 */
export function searchMatch(targetText: string, searchQuery: string): boolean {
  if (!searchQuery) return true;
  if (!targetText) return false;
  const normalizedTarget = removeVietnameseAccents(targetText);
  const normalizedQuery = removeVietnameseAccents(searchQuery);
  return normalizedTarget.includes(normalizedQuery);
}

/**
 * Calculate expected officialization date (12 months after provisional admission)
 */
export function calculateExpectedOfficialDate(admissionDateStr: string): string {
  if (!admissionDateStr) return '';
  try {
    // Check if dd/MM/yyyy
    let parts = admissionDateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      d.setFullYear(d.getFullYear() + 1);
      return formatDateVN(d);
    }
    const d = new Date(admissionDateStr);
    if (!isNaN(d.getTime())) {
      d.setFullYear(d.getFullYear() + 1);
      return formatDateVN(d);
    }
  } catch {
    // fallback
  }
  return '';
}

/**
 * Days remaining between today and target date (dd/MM/yyyy or YYYY-MM-DD)
 */
export function getDaysRemaining(targetDateStr: string): number | null {
  if (!targetDateStr) return null;
  try {
    let target: Date;
    if (targetDateStr.includes('/')) {
      const parts = targetDateStr.split('/');
      target = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else {
      target = new Date(targetDateStr);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}
