/**
 * Secure API v2 - Volatility & Risk Metrics
 * 
 * Returns volatility analysis including Sharpe ratio, 
 * max drawdown, and risk classification
 */

import { NextRequest, NextResponse } from 'next/server';
import { hybridAuthMiddleware } from '@/lib/x402';
import { getVolatilityMetrics, DataSourceError } from '@/lib/data-sources';

const ENDPOINT = '/api/v2/volatility';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
};

// Default coins for volatility analysis
const DEFAULT_COINS = ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple', 'dogecoin', 'polkadot', 'avalanche-2'];

export async function GET(request: NextRequest) {
  const authResponse = await hybridAuthMiddleware(request, ENDPOINT);
  if (authResponse) return authResponse;

  const searchParams = request.nextUrl.searchParams;
  const idsParam = searchParams.get('ids');
  const ids = idsParam ? idsParam.split(',').filter(Boolean).slice(0, 10) : DEFAULT_COINS;

  try {
    const metrics = await getVolatilityMetrics(ids);

    // Calculate market-wide stats
    const avgVolatility = metrics.reduce((sum, m) => sum + m.volatility30d, 0) / metrics.length;
    const highRiskCount = metrics.filter(m => m.riskLevel === 'high' || m.riskLevel === 'extreme').length;

    return NextResponse.json(
      {
        success: true,
        data: {
          metrics,
          summary: {
            averageVolatility30d: Math.round(avgVolatility * 10) / 10,
            highRiskAssets: highRiskCount,
            totalAnalyzed: metrics.length,
            riskDistribution: {
              low: metrics.filter(m => m.riskLevel === 'low').length,
              medium: metrics.filter(m => m.riskLevel === 'medium').length,
              high: metrics.filter(m => m.riskLevel === 'high').length,
              extreme: metrics.filter(m => m.riskLevel === 'extreme').length,
            },
          },
        },
        meta: {
          endpoint: ENDPOINT,
          coins: ids,
          timestamp: new Date().toISOString(),
          methodology: {
            volatility: 'Annualized standard deviation of daily returns',
            sharpeRatio: 'Risk-adjusted return (assuming 5% risk-free rate)',
            maxDrawdown: 'Largest peak-to-trough decline in 30 days',
            beta: 'Volatility relative to Bitcoin',
          },
        },
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    const message = error instanceof DataSourceError 
      ? error.message 
      : 'Volatility data unavailable';

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
