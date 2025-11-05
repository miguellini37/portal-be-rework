/**
 * Match email against pattern (supports * wildcard)
 */
export function matchesEmailPattern(email: string, pattern: string): boolean {
  // Exact match
  if (email === pattern) {
    return true;
  }

  // Pattern with wildcard
  if (pattern.includes('*')) {
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except *
      .replace(/\*/g, '.*'); // Replace * with .*
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(email);
  }

  return false;
}
