/**
 * Secure API v2 - Global Market Data
 * 
 * Returns aggregated global cryptocurrency market statistics
 * Source details completely hidden
 */

import { NextRequest, NextResponse } from 'next/server';
import { hybridAuthMiddleware } from '@/lib/x402';
import { getGlobalData, getFearGreedIndex, DataSourceError } from '@/lib/data-sources';

const ENDPOINT = '/api/v2/global';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function GET(request: NextRequest) {
  const authResponse = await hybridAuthMiddleware(request, ENDPOINT);
  if (authResponse) return authResponse;

  try {
    // Fetch data from multiple sources in parallel
    const [globalData, fearGreed] = await Promise.all([
      getGlobalData(),
      getFearGreedIndex().catch(() => null), // Don't fail if FNG unavailable
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          market: globalData,
          sentiment: fearGreed,
        },
        meta: {
          endpoint: ENDPOINT,
          timestamp: new Date().toISOString(),
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    const message = error instanceof DataSourceError 
      ? error.message 
      : 'Failed to fetch global market data';

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
