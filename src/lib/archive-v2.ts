/**
 * Archive utilities
 */

/**
 * Generate a unique article ID from title and source
 */
export function generateArticleId(title: string, source: string): string {
  const combined = `${source}-${title}`.toLowerCase();
  const hash = combined
    .split('')
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  return `article-${Math.abs(hash).toString(36)}`;
}
