'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface PortfolioSummaryProps {
  totalValue: number;
  totalCost: number;
  change24h?: number;
  bestPerformer?: { name: string; change: number };
  worstPerformer?: { name: string; change: number };
  isLoading?: boolean;
}

export function PortfolioSummary({
  totalValue,
  totalCost,
  change24h = 0,
  bestPerformer,
  worstPerformer,
  isLoading = false,
}: PortfolioSummaryProps) {
  const profitLoss = totalValue - totalCost;
  const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
  const isProfit = profitLoss >= 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-2xl p-6 border border-surface-border animate-pulse"
          >
            <div className="h-4 bg-surface-alt rounded w-24 mb-3" />
            <div className="h-8 bg-surface-alt rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-border">
        <div className="flex items-center gap-2 text-text-muted mb-2">
          <DollarSign className="w-5 h-5" />
          <span className="text-sm font-medium">Total Value</span>
        </div>
        <p className="text-3xl font-bold text-text-primary">
          $
          {totalValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        {change24h !== 0 && (
          <div
            className={`flex items-center gap-1 mt-2 text-sm ${
              change24h >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {change24h >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>
              {change24h >= 0 ? '+' : ''}
              {change24h.toFixed(2)}% (24h)
            </span>
          </div>
        )}
      </div>

      {/* Total P&L */}
      <div
        className={`rounded-2xl p-6 border ${
          isProfit
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}
      >
        <div className="flex items-center gap-2 text-text-muted mb-2">
          {isProfit ? (
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
          )}
          <span className="text-sm font-medium">Total P&L</span>
        </div>
        <p
          className={`text-3xl font-bold ${
            isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isProfit ? '+' : ''}
          {profitLoss >= 0 ? '$' : '-$'}
          {Math.abs(profitLoss).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p
          className={`text-sm mt-1 ${
            isProfit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}
        >
          {isProfit ? '+' : ''}
          {profitLossPercent.toFixed(2)}%
        </p>
      </div>

      {/* Best Performer */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-border">
        <div className="flex items-center gap-2 text-text-muted mb-2">
          <ArrowUpRight className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium">Best Performer</span>
        </div>
        {bestPerformer ? (
          <>
            <p className="text-xl font-bold text-text-primary">{bestPerformer.name}</p>
            <p className="text-green-600 dark:text-green-400 font-medium">
              +{bestPerformer.change.toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-gray-400 dark:text-gray-500">No data</p>
        )}
      </div>

      {/* Worst Performer */}
      <div className="bg-surface rounded-2xl p-6 border border-surface-border">
        <div className="flex items-center gap-2 text-text-muted mb-2">
          <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium">Worst Performer</span>
        </div>
        {worstPerformer ? (
          <>
            <p className="text-xl font-bold text-text-primary">{worstPerformer.name}</p>
            <p className="text-red-600 dark:text-red-400 font-medium">
              {worstPerformer.change.toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-gray-400 dark:text-gray-500">No data</p>
        )}
      </div>
    </div>
  );
}

export default PortfolioSummary;
