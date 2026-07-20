/**
 * Tiny class-name joiner (no dependency needed).
 * Filters out falsy values and joins with a space.
 */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  return inputs.filter(Boolean).join(' ');
}
