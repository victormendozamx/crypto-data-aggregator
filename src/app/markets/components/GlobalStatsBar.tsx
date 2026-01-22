'use client';

/**
 * Global Market Stats Bar
 * Displays key market metrics in a horizontal ticker
 */

import { useEffect, useState } from 'react';
import type { GlobalMarketData, FearGreedIndex } from '@/lib/market-data';
import { formatNumber, formatPercent, getFearGreedColor } from '@/lib/market-data';

interface GlobalStatsBarProps {
  global: GlobalMarketData | null;
  fearGreed: FearGreedIndex | null;
}

interface StatItemProps {
  label: string;
  value: string;
  change?: number | null;
  icon?: string;
  color?: string;
}

function StatItem({ label, value, change, icon, color }: StatItemProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
      {icon && <span className="text-sm text-neutral-900 dark:text-white">{icon}</span>}
      <span className="text-neutral-500 dark:text-neutral-400 text-sm">{label}:</span>
      <span className={`font-semibold ${color || 'text-neutral-900 dark:text-white'}`}>
        {value}
      </span>
      {change != null && (
        <span className={`text-sm ${change >= 0 ? 'text-neutral-900 dark:text-white font-semibold' : 'text-neutral-500 dark:text-neutral-400'}`}>
          {formatPercent(change)}
        </span>
      )}
    </div>
  );
}

export default function GlobalStatsBar({ global, fearGreed }: GlobalStatsBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!global) {
    return (
      <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 py-2 overflow-x-auto scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const fearGreedValue = fearGreed ? Number(fearGreed.value) : 0;

  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 py-1 overflow-x-auto scrollbar-hide">
          <StatItem
            label="Market Cap"
            value={`$${formatNumber(global.total_market_cap?.usd)}`}
            change={global.market_cap_change_percentage_24h_usd}
          />
          
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-2" />
          
          <StatItem
            label="24h Volume"
            value={`$${formatNumber(global.total_volume?.usd)}`}
          />
          
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-2" />
          
          <StatItem
            label="BTC Dominance"
            value={`${global.market_cap_percentage?.btc?.toFixed(1)}%`}
            icon="₿"
          />
          
          {global.market_cap_percentage?.eth && (
            <>
              <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-2" />
              <StatItem
                label="ETH Dominance"
                value={`${global.market_cap_percentage.eth.toFixed(1)}%`}
                icon="Ξ"
              />
            </>
          )}
          
          {fearGreed && mounted && (
            <>
              <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-2" />
              <div className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                <span className="text-neutral-500 dark:text-neutral-400 text-sm">Fear & Greed:</span>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {fearGreed.value}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400 text-xs">
                  ({fearGreed.value_classification})
                </span>
                <div className="w-16 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all bg-neutral-900 dark:bg-white"
                    style={{ width: `${fearGreedValue}%` }}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-2" />
          
          <StatItem
            label="Active Cryptos"
            value={global.active_cryptocurrencies?.toLocaleString() || '0'}
          />
          
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-2" />
          
          <StatItem
            label="Markets"
            value={global.markets?.toLocaleString() || '0'}
          />
        </div>
      </div>
    </div>
  );
}
