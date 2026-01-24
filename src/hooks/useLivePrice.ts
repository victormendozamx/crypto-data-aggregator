/**
 * @fileoverview Live Price WebSocket Hook
 *
 * Real-time price updates via WebSocket with reconnection,
 * exponential backoff, and batched updates.
 *
 * @module hooks/useLivePrice
 */
'use client';

import { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext, type ReactNode } from 'react';

// =============================================================================
// TYPES
// =============================================================================

export interface LivePriceData {
  price: number;
  change24h: number;
  lastUpdate: number;
}

export interface UseLivePriceResult {
  price: number | null;
  change24h: number | null;
  isLive: boolean;
  lastUpdate: Date | null;
  isStale: boolean;
}

export interface UseLivePricesResult {
  prices: Record<string, LivePriceData>;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  reconnect: () => void;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

// =============================================================================
// WEBSOCKET CONTEXT (Shared connection)
// =============================================================================

interface WebSocketContextValue {
  status: ConnectionStatus;
  prices: Record<string, LivePriceData>;
  subscribe: (coinIds: string[]) => void;
  unsubscribe: (coinIds: string[]) => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

// Stale threshold: 60 seconds without update
const STALE_THRESHOLD = 60_000;

// Batch update interval: Batch updates to prevent excessive re-renders
const BATCH_INTERVAL = 100;

// =============================================================================
// WEBSOCKET PROVIDER
// =============================================================================

export interface LivePriceProviderProps {
  children: ReactNode;
  wsUrl?: string;
}

// Provider is only available in the .tsx file
// Import from '@/hooks' or use LivePriceProvider from useLivePrice.tsx directly

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook to get live price for a single coin
 */
export function useLivePrice(
  coinId: string,
  initialPrice?: number
): UseLivePriceResult {
  const context = useContext(WebSocketContext);
  
  const [localPrice, setLocalPrice] = useState<number | null>(initialPrice ?? null);

  // Subscribe to this coin
  useEffect(() => {
    if (context) {
      context.subscribe([coinId]);
      return () => context.unsubscribe([coinId]);
    }
  }, [context, coinId]);

  // Get price from context or fallback
  const priceData = context?.prices[coinId];
  const price = priceData?.price ?? localPrice;
  const change24h = priceData?.change24h ?? null;
  const lastUpdate = priceData?.lastUpdate ? new Date(priceData.lastUpdate) : null;
  const isLive = context?.status === 'connected' && !!priceData;
  const isStale = priceData
    ? Date.now() - priceData.lastUpdate > STALE_THRESHOLD
    : false;

  return {
    price,
    change24h,
    isLive,
    lastUpdate,
    isStale,
  };
}

/**
 * Hook to get live prices for multiple coins
 */
export function useLivePrices(coinIds: string[]): UseLivePricesResult {
  const context = useContext(WebSocketContext);

  // Subscribe to all coins
  useEffect(() => {
    if (context && coinIds.length > 0) {
      context.subscribe(coinIds);
      return () => context.unsubscribe(coinIds);
    }
  }, [context, coinIds]);

  if (!context) {
    return {
      prices: {},
      isConnected: false,
      isConnecting: false,
      connectionError: null,
      reconnect: () => {},
    };
  }

  return {
    prices: context.prices,
    isConnected: context.status === 'connected',
    isConnecting: context.status === 'connecting',
    connectionError: context.status === 'error' ? 'Connection failed' : null,
    reconnect: context.reconnect,
  };
}

/**
 * Hook to get WebSocket connection status
 */
export function useConnectionStatus(): {
  status: ConnectionStatus;
  reconnect: () => void;
} {
  const context = useContext(WebSocketContext);

  return {
    status: context?.status ?? 'disconnected',
    reconnect: context?.reconnect ?? (() => {}),
  };
}

export default useLivePrice;
