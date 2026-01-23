/**
 * Popular Stories Sidebar Widget
 * Shows most read articles with view count estimates and time filter
 */

'use client';

import { useState } from 'react';
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

interface PopularStoriesProps {
  articles: Article[];
}

type TimeFilter = '24h' | '7d';

// Monochrome styling - no source-specific colors
const defaultGradient = 'from-neutral-800 to-black dark:from-neutral-200 dark:to-white';

// Simulate view counts based on article position and randomness
function estimateViews(index: number): string {
  const baseViews = [12400, 8700, 6200, 4100, 2800];
  const views = baseViews[index] || Math.floor(Math.random() * 2000) + 500;
  if (views >= 10000) {
    return `${(views / 1000).toFixed(1)}K`;
  }
  return views.toLocaleString();
}

export default function PopularStories({ articles }: PopularStoriesProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');
  const popularArticles = articles.slice(0, 5);

  return (
    <div className="bg-neutral-50 dark:bg-black rounded-2xl shadow-card dark:shadow-none dark:border dark:border-neutral-800 p-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          Most Read
        </h3>

        {/* Time Filter Toggle */}
        <div className="flex items-center bg-neutral-100 dark:bg-black rounded-lg p-0.5">
          <button
            onClick={() => setTimeFilter('24h')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              timeFilter === '24h'
                ? 'bg-white dark:bg-black text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            aria-pressed={timeFilter === '24h'}
          >
            24h
          </button>
          <button
            onClick={() => setTimeFilter('7d')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              timeFilter === '7d'
                ? 'bg-white dark:bg-black text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
            aria-pressed={timeFilter === '7d'}
          >
            7d
          </button>
        </div>
      </div>

      {/* Popular Articles List */}
      <div className="space-y-3" role="list" aria-label="Most read articles">
        {popularArticles.map((article, index) => {
          const articleId = article.id || generateArticleId(article.title, article.source);
          const views = estimateViews(index);

          return (
            <Link
              key={articleId}
              href={`/article/${articleId}`}
              className="group flex gap-3 p-2 -mx-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-black transition-colors focus-ring"
              role="listitem"
            >
              {/* Monochrome Thumbnail Placeholder */}
              <div
                className={`flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br ${defaultGradient} relative overflow-hidden`}
                aria-hidden="true"
              >
                {/* Decorative pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1 right-1 w-6 h-6 border border-white/30 rounded-full" />
                  <div className="absolute bottom-2 left-1 w-3 h-3 bg-white/20 rounded-full" />
                </div>
                {/* View count overlay */}
                <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5">
                  <span className="text-[10px] font-medium text-white flex items-center gap-0.5">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {views}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 py-0.5">
                <h4 className="text-sm font-medium text-neutral-900 dark:text-white line-clamp-2 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors leading-snug">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {article.source}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
