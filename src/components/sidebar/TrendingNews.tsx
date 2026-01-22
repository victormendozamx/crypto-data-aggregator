/**
 * Trending News Sidebar Widget
 * Displays numbered list of trending/hot stories
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

interface TrendingNewsProps {
  articles: Article[];
  title?: string;
  showRefreshIndicator?: boolean;
}

// Monochrome source styling
const defaultSourceColor = 'bg-neutral-400 dark:bg-neutral-500';

export default function TrendingNews({ 
  articles, 
  title = 'Trending Now',
  showRefreshIndicator = true 
}: TrendingNewsProps) {
  const trendingArticles = articles.slice(0, 5);

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 rounded-2xl shadow-card dark:shadow-none dark:border dark:border-neutral-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
          {title}
        </h3>
        {showRefreshIndicator && (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 dark:bg-neutral-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black dark:bg-white"></span>
            </span>
            Live
          </div>
        )}
      </div>

      {/* Trending List */}
      <div className="space-y-1" role="list" aria-label="Trending news articles">
        {trendingArticles.map((article, index) => {
          const articleId = article.id || generateArticleId(article.title, article.source);
          
          return (
            <Link
              key={articleId}
              href={`/article/${articleId}`}
              className="group flex items-start gap-3 p-3 -mx-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors focus-ring"
              role="listitem"
            >
              {/* Rank Number */}
              <span 
                className={`
                  flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold
                  ${index < 3 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                  }
                `}
              >
                {index + 1}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-snug">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${defaultSourceColor}`} aria-hidden="true" />
                  <span className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                    {article.source}
                  </span>
                  <span className="text-neutral-300 dark:text-neutral-600" aria-hidden="true">•</span>
                  <time 
                    className="text-xs text-neutral-500 dark:text-neutral-400"
                    dateTime={article.pubDate}
                  >
                    {article.timeAgo}
                  </time>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* See All Link */}
      <Link
        href="/trending"
        className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors focus-ring rounded-lg py-2 -mx-2"
      >
        See all trending
        <svg 
          className="w-4 h-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
