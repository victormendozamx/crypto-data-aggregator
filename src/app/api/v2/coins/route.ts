/**
 * Secure API v2 - Coins Endpoint
 * 
 * Returns cryptocurrency market data with source obfuscation
 * All upstream provider details are hidden from responses
 * 
 * @price $0.001 per request
 */

import { NextRequest, NextResponse } from 'next/server';
import { hybridAuthMiddleware } from '@/lib/x402';
import { getCoinMarkets, DataSourceError } from '@/lib/data-sources';

const ENDPOINT = '/api/v2/coins';

// Security headers to prevent information leakage
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
  // Intentionally omit any source identification headers
};

export async function GET(request: NextRequest) {
  // Check authentication (API key or x402 payment)
  const authResponse = await hybridAuthMiddleware(request, ENDPOINT);
  if (authResponse) return authResponse;

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const perPage = Math.min(250, Math.max(1, parseInt(searchParams.get('per_page') || '100')));
  const order = searchParams.get('order') || 'market_cap_desc';
  const ids = searchParams.get('ids')?.split(',').filter(Boolean);
  const sparkline = searchParams.get('sparkline') === 'true';

  try {
    const data = await getCoinMarkets({
      page,
      perPage,
      order,
      ids,
      sparkline,
    });

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          endpoint: ENDPOINT,
          page,
          perPage,
          count: data.length,
          hasMore: data.length === perPage,
          timestamp: new Date().toISOString(),
          // No source information exposed
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    // Generic error - no upstream details leaked
    const message = error instanceof DataSourceError 
      ? error.message 
      : 'An error occurred processing your request';
    
    const code = error instanceof DataSourceError 
      ? error.code 
      : 'INTERNAL_ERROR';

    return NextResponse.json(
      {
        success: false,
        error: message,
        code,
        // No stack traces or source details
      },
      { 
        status: error instanceof DataSourceError ? 503 : 500,
        headers: SECURITY_HEADERS,
      }
    );
  }
}
