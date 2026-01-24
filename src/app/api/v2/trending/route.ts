/**
 * Secure API v2 - Trending Cryptocurrencies
 * 
 * Returns trending coins based on search popularity
 */

import { NextRequest, NextResponse } from 'next/server';
import { hybridAuthMiddleware } from '@/lib/x402';
import { getTrendingCoins, DataSourceError } from '@/lib/data-sources';

const ENDPOINT = '/api/v2/trending';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function GET(request: NextRequest) {
  const authResponse = await hybridAuthMiddleware(request, ENDPOINT);
  if (authResponse) return authResponse;

  try {
    const trending = await getTrendingCoins();

    return NextResponse.json(
      {
        success: true,
        data: {
          coins: trending,
          count: trending.length,
        },
        meta: {
          endpoint: ENDPOINT,
          timestamp: new Date().toISOString(),
          refreshInterval: 300, // 5 minutes
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    const message = error instanceof DataSourceError 
      ? error.message 
      : 'Trending data unavailable';

    return NextResponse.json(
      {
        success: false,
        error: message,
        code: 'SERVICE_UNAVAILABLE',
      },
      { status: 503, headers: SECURITY_HEADERS }
    );
  }
}
