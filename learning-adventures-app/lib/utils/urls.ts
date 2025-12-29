/**
 * URL utility functions for subdomain-based routing
 * Handles routing between app.learningadventures.org and learningadventures.org
 */

/**
 * Get the full app URL for a given path
 * @param path - The path to append (e.g., '/dashboard', '/courses')
 * @returns Full URL with app subdomain
 * @example
 * getAppUrl('/dashboard') // Returns: 'https://app.learningadventures.org/dashboard'
 */
export function getAppUrl(path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

/**
 * Get the marketing site URL
 * @param path - Optional path to append to marketing site URL
 * @returns Marketing site URL
 * @example
 * getMarketingUrl() // Returns: 'https://learningadventures.org'
 * getMarketingUrl('/pricing') // Returns: 'https://learningadventures.org/pricing'
 */
export function getMarketingUrl(path: string = ''): string {
  const baseUrl = process.env.NEXT_PUBLIC_MARKETING_URL || 'http://localhost:3001';
  // Ensure path starts with /
  const normalizedPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${baseUrl}${normalizedPath}`;
}
