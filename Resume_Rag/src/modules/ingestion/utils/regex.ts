export const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

export const PHONE_REGEX = /(\+?\d{1,3}[-\s]?)?(\d{5}[-\s]?\d{5})/;

export const EXPERIENCE_REGEX = /(\d+(?:\.\d+)?)\s*(?:\+\s*)?(years?|yrs?)/i;

export function extractFirstMatch(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match ? match[0].trim() : null;
}

export function extractEmail(text: string): string | null {
  return extractFirstMatch(text, EMAIL_REGEX);
}

export function extractPhone(text: string): string | null {
  return extractFirstMatch(text, PHONE_REGEX);
}

export function extractExperienceYears(text: string): number | null {
  const match = text.match(EXPERIENCE_REGEX);

  if (!match || !match[1]) {
    return null;
  }

  const value = Number.parseFloat(match[1]);
  return Number.isFinite(value) ? value : null;
}
