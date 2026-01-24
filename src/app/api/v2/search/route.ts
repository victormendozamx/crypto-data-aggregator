/**
 * Secure API v2 - Search
 * 
 * Search for cryptocurrencies, exchanges, and NFTs
 */

import { NextRequest, NextResponse } from 'next/server';
import { hybridAuthMiddleware } from '@/lib/x402';
import { searchCoins, DataSourceError } from '@/lib/data-sources';

const ENDPOINT = '/api/v2/search';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
};

export async function GET(request: NextRequest) {
  const authResponse = await hybridAuthMiddleware(request, ENDPOINT);
  if (authResponse) return authResponse;

  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || searchParams.get('query');

  if (!query || query.length < 2) {
    return NextResponse.json(
      {
        success: false,
        error: 'Query must be at least 2 characters',
        code: 'INVALID_REQUEST',
      },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  if (query.length > 100) {
    return NextResponse.json(
      {
        success: false,
        error: 'Query too long (max 100 characters)',
        code: 'INVALID_REQUEST',
      },
      { status: 400, headers: SECURITY_HEADERS }
    );
  }

  try {
    const results = await searchCoins(query);

    // Group by type
    const coins = results.filter(r => r.type === 'coin');
    const exchanges = results.filter(r => r.type === 'exchange');

    return NextResponse.json(
      {
        success: true,
        data: {
          coins,
          exchanges,
          total: results.length,
        },
        meta: {
          endpoint: ENDPOINT,
          query,
          timestamp: new Date().toISOString(),
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    const message = error instanceof DataSourceError 
      ? error.message 
      : 'Search unavailable';

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
