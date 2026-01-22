/**
 * Translation utilities stub
 * This is a minimal implementation - translation features are disabled
 */

export const SUPPORTED_LANGUAGES = ['en', 'es', 'zh', 'ja', 'ko'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export function isLanguageSupported(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

export async function translateArticles<T>(articles: T[], _targetLang: string): Promise<T[]> {
  // Translation is disabled - return articles as-is
  return articles;
}
