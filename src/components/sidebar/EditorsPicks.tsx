/**
 * Editor's Picks Sidebar Widget
 * Curated articles from different sources
 */

import Link from 'next/link';
import { generateArticleId } from '@/lib/archive-v2';

interface Article {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  timeAgo: string;
  id?: string;
}

interface EditorsPicksProps {
  articles: Article[];
}

// Monochrome source styling
const defaultStyle = {
  dot: 'bg-neutral-400 dark:bg-neutral-500',
  bg: 'bg-neutral-100 dark:bg-black',
};

// Get articles from different sources for variety
function getVariedArticles(articles: Article[], count: number): Article[] {
  const seen = new Set<string>();
  const result: Article[] = [];

  for (const article of articles) {
    if (!seen.has(article.source) && result.length < count) {
      result.push(article);
      seen.add(article.source);
    }
  }

  // If we couldn't get enough unique sources, fill with remaining articles
  if (result.length < count) {
    for (const article of articles) {
      if (!result.includes(article) && result.length < count) {
        result.push(article);
      }
    }
  }

  return result;
}

export default function EditorsPicks({ articles }: EditorsPicksProps) {
  const picks = getVariedArticles(articles, 3);

  return (
    <div className="bg-neutral-50 dark:bg-black rounded-2xl shadow-card dark:shadow-none dark:border dark:border-neutral-800 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <svg
          className="w-5 h-5 text-neutral-700 dark:text-neutral-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white">Editor's Picks</h3>
      </div>

      {/* Picks List */}
      <div className="space-y-4" role="list" aria-label="Editor's picks">
        {picks.map((article, index) => {
          const articleId = article.id || generateArticleId(article.title, article.source);

          return (
            <Link
              key={articleId}
              href={`/article/${articleId}`}
              className="group block p-4 -mx-4 rounded-xl hover:bg-neutral-100 dark:hover:bg-black transition-all duration-200 focus-ring"
              role="listitem"
            >
              {/* Source Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${defaultStyle.dot}`} aria-hidden="true" />
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${defaultStyle.bg} text-neutral-700 dark:text-neutral-300`}
                >
                  {article.source}
                </span>
                {index === 0 && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-black dark:bg-white text-white dark:text-black">
                    Top Pick
                  </span>
                )}
              </div>

              {/* Title */}
              <h4 className="text-base font-semibold text-neutral-900 dark:text-white line-clamp-2 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-snug">
                {article.title}
              </h4>

              {/* Meta */}
              <div className="flex items-center justify-between mt-2">
                <time
                  className="text-xs text-neutral-500 dark:text-neutral-400"
                  dateTime={article.pubDate}
                >
                  {article.timeAgo}
                </time>
                <span className="text-neutral-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium">
                  Read
                  <svg
                    className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Divider */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 mt-4 pt-4">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
          Curated by our editorial team
        </p>
      </div>
    </div>
  );
}
