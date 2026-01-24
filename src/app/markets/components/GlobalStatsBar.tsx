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
      {icon && <span className="text-sm text-text-primary">{icon}</span>}
      <span className="text-text-muted text-sm">{label}:</span>
      <span className={`font-semibold ${color || 'text-text-primary'}`}>
        {value}
      </span>
      {change != null && (
        <span
          className={`text-sm ${change >= 0 ? 'text-text-primary font-semibold' : 'text-text-muted'}`}
        >
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
      <div className="bg-surface-alt border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4 py-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-6 w-32 bg-surface-hover rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const fearGreedValue = fearGreed ? Number(fearGreed.value) : 0;

  return (
    <div className="bg-surface-alt border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 py-2">
          <StatItem
            label="Market Cap"
            value={`$${formatNumber(global.total_market_cap?.usd)}`}
            change={global.market_cap_change_percentage_24h_usd}
          />

          <div className="hidden sm:block h-4 w-px bg-surface-border mx-2" />

          <StatItem label="24h Volume" value={`$${formatNumber(global.total_volume?.usd)}`} />

          <div className="hidden sm:block h-4 w-px bg-surface-border mx-2" />

          <StatItem
            label="BTC Dom"
            value={`${global.market_cap_percentage?.btc?.toFixed(1)}%`}
            icon="₿"
          />

          {global.market_cap_percentage?.eth && (
            <>
              <div className="hidden sm:block h-4 w-px bg-surface-border mx-2" />
              <StatItem
                label="ETH Dom"
                value={`${global.market_cap_percentage.eth.toFixed(1)}%`}
                icon="Ξ"
              />
            </>
          )}

          {fearGreed && mounted && (
            <>
              <div className="hidden sm:block h-4 w-px bg-surface-border mx-2" />
              <div className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                <span className="text-text-muted text-sm">
                  Fear & Greed:
                </span>
                <span className="font-semibold text-text-primary">
                  {fearGreed.value}
                </span>
                <span className="text-text-muted text-xs">
                  ({fearGreed.value_classification})
                </span>
                <div className="w-16 h-2 bg-surface-hover rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all bg-text-primary"
                    style={{ width: `${fearGreedValue}%` }}
                  />
                </div>
              </div>
            </>
          )}

          <div className="hidden lg:block h-4 w-px bg-surface-border mx-2" />

          <div className="hidden lg:block">
            <StatItem
              label="Cryptos"
              value={global.active_cryptocurrencies?.toLocaleString() || '0'}
            />
          </div>

          <div className="hidden xl:block h-4 w-px bg-surface-border mx-2" />

          <div className="hidden xl:block">
            <StatItem label="Markets" value={global.markets?.toLocaleString() || '0'} />
          </div>
        </div>
      </div>
    </div>
  );
}
