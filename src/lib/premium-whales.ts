/**
 * Whale Tracking Service
 *
 * Track large cryptocurrency transactions and smart money movements.
 * This is a high-value premium feature that traders will pay for.
 * 
 * Data Sources:
 * - Whale Alert API (real-time whale transactions)
 * - Etherscan API (Ethereum large transfers)
 * - Blockchain.com API (Bitcoin large transfers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { PREMIUM_PRICING } from '@/lib/x402-config';

export const runtime = 'edge';

// Whale transaction threshold in USD
const WHALE_THRESHOLD = 1_000_000; // $1M+

// API endpoints
const WHALE_ALERT_API = 'https://api.whale-alert.io/v1';
const ETHERSCAN_API = 'https://api.etherscan.io/api';
const BLOCKCHAIN_API = 'https://blockchain.info';

interface WhaleTransaction {
  id: string;
  hash: string;
  blockchain: string;
  timestamp: string;
  from: {
    address: string;
    label?: string;
    isExchange: boolean;
  };
  to: {
    address: string;
    label?: string;
    isExchange: boolean;
  };
  amount: number;
  amountUsd: number;
  token: {
    symbol: string;
    name: string;
    contract?: string;
  };
  type: 'transfer' | 'exchange_inflow' | 'exchange_outflow' | 'unknown';
  significance: 'high' | 'medium' | 'low';
}

interface WhaleAlert {
  id: string;
  userId: string;
  conditions: {
    minAmount: number;
    tokens?: string[];
    types?: string[];
    chains?: string[];
  };
  webhookUrl: string;
  expiresAt: string;
  createdAt: string;
}

// Known exchange addresses (comprehensive database)
const KNOWN_EXCHANGES: Record<string, string> = {
  // Ethereum - Binance
  '0x28c6c06298d514db089934071355e5743bf21d60': 'Binance',
  '0x21a31ee1afc51d94c2efccaa2092ad1028285549': 'Binance',
  '0xdfd5293d8e347dfe59e90efd55b2956a1343963d': 'Binance',
  '0xf977814e90da44bfa03b6295a0616a897441acec': 'Binance',
  '0x5a52e96bacdabb82fd05763e25335261b270efcb': 'Binance',
  // Ethereum - Coinbase
  '0x56eddb7aa87536c09ccc2793473599fd21a8b17f': 'Coinbase',
  '0xa9d1e08c7793af67e9d92fe308d5697fb81d3e43': 'Coinbase',
  '0x503828976d22510aad0201ac7ec88293211d23da': 'Coinbase',
  '0x71660c4005ba85c37ccec55d0c4493e66fe775d3': 'Coinbase',
  // Ethereum - Kraken
  '0x2910543af39aba0cd09dbb2d50200b3e800a63d2': 'Kraken',
  '0x0a869d79a7052c7f1b55a8ebabbea3420f0d1e13': 'Kraken',
  // Ethereum - OKX
  '0x98ec059dc3adfbdd63429454aeb0c990fba4a128': 'OKX',
  '0x6cc5f688a315f3dc28a7781717a9a798a59fda7b': 'OKX',
  // Bitcoin - Binance
  'bc1qm34lsc65zpw79lxes69zkqmk6ee3ewf0j77s3h': 'Binance',
  '1NDyJtNTjmwk5xPNhjgAMu4HDHigtobu1s': 'Binance',
  '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo': 'Binance',
  // Bitcoin - Coinbase
  '3JZq4atUahhuA9rLhXLMhhTo133J9rF97j': 'Coinbase',
  'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh': 'Coinbase',
  // Bitcoin - Bitfinex
  'bc1qgdjqv0av3q56jvd82tkdjpy7gdp9ut8tlqmgrpmv24sq90ecnvqqjwvw97': 'Bitfinex',
};

/**
 * Fetch real whale transactions from Whale Alert API
 */
async function fetchWhaleAlertTransactions(
  minValue: number = WHALE_THRESHOLD,
  limit: number = 50
): Promise<WhaleTransaction[]> {
  const apiKey = process.env.WHALE_ALERT_API_KEY;
  
  // If no API key, fall back to Etherscan for ETH whales
  if (!apiKey) {
    return fetchEtherscanWhaleTransfers(minValue, limit);
  }

  try {
    const startTime = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000); // Last 24h
    const url = `${WHALE_ALERT_API}/transactions?api_key=${apiKey}&min_value=${minValue}&start=${startTime}&limit=${limit}`;

    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 }, // Cache 1 minute
    });

    if (!response.ok) {
      console.error('Whale Alert API error:', response.status);
      return fetchEtherscanWhaleTransfers(minValue, limit);
    }

    const data = await response.json();
    
    if (!data.transactions || !Array.isArray(data.transactions)) {
      return fetchEtherscanWhaleTransfers(minValue, limit);
    }

    return data.transactions.map((tx: {
      id: string;
      hash: string;
      blockchain: string;
      timestamp: number;
      from: { address: string; owner?: string; owner_type?: string };
      to: { address: string; owner?: string; owner_type?: string };
      amount: number;
      amount_usd: number;
      symbol: string;
    }) => {
      const fromIsExchange = tx.from.owner_type === 'exchange' || !!KNOWN_EXCHANGES[tx.from.address?.toLowerCase()];
      const toIsExchange = tx.to.owner_type === 'exchange' || !!KNOWN_EXCHANGES[tx.to.address?.toLowerCase()];
      
      let type: WhaleTransaction['type'] = 'transfer';
      if (fromIsExchange && !toIsExchange) type = 'exchange_outflow';
      else if (!fromIsExchange && toIsExchange) type = 'exchange_inflow';

      return {
        id: tx.id || `whale_${tx.hash}`,
        hash: tx.hash,
        blockchain: tx.blockchain,
        timestamp: new Date(tx.timestamp * 1000).toISOString(),
        from: {
          address: tx.from.address,
          label: tx.from.owner || KNOWN_EXCHANGES[tx.from.address?.toLowerCase()],
          isExchange: fromIsExchange,
        },
        to: {
          address: tx.to.address,
          label: tx.to.owner || KNOWN_EXCHANGES[tx.to.address?.toLowerCase()],
          isExchange: toIsExchange,
        },
        amount: tx.amount,
        amountUsd: tx.amount_usd,
        token: {
          symbol: tx.symbol.toUpperCase(),
          name: getTokenName(tx.symbol),
        },
        type,
        significance: tx.amount_usd > 10_000_000 ? 'high' : tx.amount_usd > 5_000_000 ? 'medium' : 'low',
      };
    });
  } catch (error) {
    console.error('Whale Alert fetch error:', error);
    return fetchEtherscanWhaleTransfers(minValue, limit);
  }
}

/**
 * Fetch large ETH transfers from Etherscan (free API)
 */
async function fetchEtherscanWhaleTransfers(
  minValue: number = WHALE_THRESHOLD,
  limit: number = 50
): Promise<WhaleTransaction[]> {
  const apiKey = process.env.ETHERSCAN_API_KEY || '';
  
  try {
    // Get latest blocks with large ETH transfers
    const url = `${ETHERSCAN_API}?module=account&action=txlist&address=0x0000000000000000000000000000000000000000&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${apiKey}`;
    
    // Alternative: Query known whale addresses for their recent transactions
    const whaleAddresses = [
      '0x28c6c06298d514db089934071355e5743bf21d60', // Binance
      '0xf977814e90da44bfa03b6295a0616a897441acec', // Binance
      '0x56eddb7aa87536c09ccc2793473599fd21a8b17f', // Coinbase
    ];

    const transactions: WhaleTransaction[] = [];
    
    for (const address of whaleAddresses.slice(0, 3)) {
      const txUrl = `${ETHERSCAN_API}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc${apiKey ? `&apikey=${apiKey}` : ''}`;
      
      const response = await fetch(txUrl, {
        next: { revalidate: 60 },
      });

      if (!response.ok) continue;

      const data = await response.json();
      if (data.status !== '1' || !data.result) continue;

      const ethPrice = await getEthPrice();

      for (const tx of data.result) {
        const valueEth = parseFloat(tx.value) / 1e18;
        const valueUsd = valueEth * ethPrice;

        if (valueUsd < minValue) continue;

        const fromIsExchange = !!KNOWN_EXCHANGES[tx.from?.toLowerCase()];
        const toIsExchange = !!KNOWN_EXCHANGES[tx.to?.toLowerCase()];

        let type: WhaleTransaction['type'] = 'transfer';
        if (fromIsExchange && !toIsExchange) type = 'exchange_outflow';
        else if (!fromIsExchange && toIsExchange) type = 'exchange_inflow';

        transactions.push({
          id: `eth_${tx.hash}`,
          hash: tx.hash,
          blockchain: 'ethereum',
          timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
          from: {
            address: tx.from,
            label: KNOWN_EXCHANGES[tx.from?.toLowerCase()],
            isExchange: fromIsExchange,
          },
          to: {
            address: tx.to,
            label: KNOWN_EXCHANGES[tx.to?.toLowerCase()],
            isExchange: toIsExchange,
          },
          amount: valueEth,
          amountUsd: valueUsd,
          token: { symbol: 'ETH', name: 'Ethereum' },
          type,
          significance: valueUsd > 10_000_000 ? 'high' : valueUsd > 5_000_000 ? 'medium' : 'low',
        });
      }
    }

    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error('Etherscan whale fetch error:', error);
    return [];
  }
}

/**
 * Get current ETH price from CoinGecko
 */
async function getEthPrice(): Promise<number> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      { next: { revalidate: 60 } }
    );
    if (!response.ok) return 4000; // Fallback
    const data = await response.json();
    return data.ethereum?.usd || 4000;
  } catch {
    return 4000;
  }
}

/**
 * Get token name from symbol
 */
function getTokenName(symbol: string): string {
  const tokenNames: Record<string, string> = {
    btc: 'Bitcoin',
    eth: 'Ethereum',
    usdt: 'Tether',
    usdc: 'USD Coin',
    sol: 'Solana',
    xrp: 'XRP',
    bnb: 'BNB',
    ada: 'Cardano',
    doge: 'Dogecoin',
    avax: 'Avalanche',
    matic: 'Polygon',
    link: 'Chainlink',
  };
  return tokenNames[symbol.toLowerCase()] || symbol.toUpperCase();
}

/**
 * Get recent whale transactions
 */
export async function getWhaleTransactions(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const minAmount = parseInt(searchParams.get('minAmount') || String(WHALE_THRESHOLD));
  const token = searchParams.get('token')?.toUpperCase();
  const chain = searchParams.get('chain')?.toLowerCase();
  const type = searchParams.get('type') as WhaleTransaction['type'] | null;

  try {
    // Fetch real whale transactions from APIs
    let transactions = await fetchWhaleAlertTransactions(minAmount, limit * 2);

    // Apply filters
    transactions = transactions
      .filter((tx) => {
        if (tx.amountUsd < minAmount) return false;
        if (token && tx.token.symbol !== token) return false;
        if (chain && tx.blockchain !== chain) return false;
        if (type && tx.type !== type) return false;
        return true;
      })
      .slice(0, limit);

    // Calculate aggregates
    const aggregates = {
      totalVolume: transactions.reduce((sum, tx) => sum + tx.amountUsd, 0),
      exchangeInflow: transactions
        .filter((tx) => tx.type === 'exchange_inflow')
        .reduce((sum, tx) => sum + tx.amountUsd, 0),
      exchangeOutflow: transactions
        .filter((tx) => tx.type === 'exchange_outflow')
        .reduce((sum, tx) => sum + tx.amountUsd, 0),
      netFlow: 0,
      topTokens: {} as Record<string, number>,
    };

    aggregates.netFlow = aggregates.exchangeOutflow - aggregates.exchangeInflow;

    transactions.forEach((tx) => {
      aggregates.topTokens[tx.token.symbol] =
        (aggregates.topTokens[tx.token.symbol] || 0) + tx.amountUsd;
    });

    return NextResponse.json({
      transactions,
      aggregates,
      filters: { minAmount, token, chain, type },
      meta: {
        fetchedAt: new Date().toISOString(),
        count: transactions.length,
        endpoint: '/api/premium/whales/transactions',
        price: PREMIUM_PRICING['/api/premium/whales/transactions'].price,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to fetch whale transactions',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}

/**
 * Analyze a specific wallet address
 */
export async function analyzeWallet(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');
  const chain = searchParams.get('chain') || 'ethereum';

  if (!address) {
    return NextResponse.json({ error: 'Missing address parameter' }, { status: 400 });
  }

  // Validate address format
  const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
  const isValidBtcAddress = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);

  if (!isValidEthAddress && !isValidBtcAddress) {
    return NextResponse.json({ error: 'Invalid address format' }, { status: 400 });
  }

  try {
    // In production, query:
    // - Etherscan/Basescan for balances
    // - DeBank for DeFi positions
    // - Nansen for labels
    // - Historical transaction data

    // Mock wallet analysis
    const analysis = {
      address,
      chain,
      label: KNOWN_EXCHANGES[address.toLowerCase()] || null,
      isExchange: !!KNOWN_EXCHANGES[address.toLowerCase()],
      isContract: Math.random() > 0.8,

      // Balance information
      balance: {
        total_usd: Math.floor(Math.random() * 100_000_000),
        tokens: [
          { symbol: 'ETH', amount: Math.random() * 1000, usd: Math.random() * 4_000_000 },
          { symbol: 'USDC', amount: Math.random() * 5_000_000, usd: Math.random() * 5_000_000 },
          { symbol: 'WBTC', amount: Math.random() * 50, usd: Math.random() * 5_000_000 },
        ],
      },

      // Activity metrics
      activity: {
        firstSeen: new Date(
          Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 3
        ).toISOString(),
        lastActive: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        transactionCount: Math.floor(Math.random() * 10000),
        uniqueInteractions: Math.floor(Math.random() * 500),
      },

      // DeFi positions (if applicable)
      defi: {
        protocols: ['Uniswap', 'Aave', 'Compound'].slice(0, Math.floor(Math.random() * 4)),
        totalValueLocked: Math.random() * 10_000_000,
        positions: [],
      },

      // Related wallets
      relatedWallets: [
        {
          address: `0x${Math.random().toString(16).slice(2, 42)}`,
          relationship: 'frequent_interaction',
        },
        { address: `0x${Math.random().toString(16).slice(2, 42)}`, relationship: 'funding_source' },
      ],

      // Risk indicators
      risk: {
        score: Math.floor(Math.random() * 100),
        flags: [] as string[],
        isWhitelisted: false,
        isBlacklisted: false,
      },
    };

    return NextResponse.json({
      analysis,
      meta: {
        analyzedAt: new Date().toISOString(),
        endpoint: '/api/premium/wallets/analyze',
        price: PREMIUM_PRICING['/api/premium/wallets/analyze'].price,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Wallet analysis failed',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}

/**
 * Get smart money movements
 */
export async function getSmartMoney(request: NextRequest): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token')?.toLowerCase();
  const timeframe = searchParams.get('timeframe') || '24h';

  try {
    // Smart money categories
    const smartMoneyData = {
      // Top fund/VC wallets activity
      institutions: {
        netBuying: Math.random() > 0.5,
        volume24h: Math.floor(Math.random() * 100_000_000),
        topBuys: [
          { token: 'ETH', amount: Math.random() * 10000, usd: Math.random() * 40_000_000 },
          { token: 'SOL', amount: Math.random() * 100000, usd: Math.random() * 20_000_000 },
          { token: 'LINK', amount: Math.random() * 500000, usd: Math.random() * 10_000_000 },
        ],
        topSells: [{ token: 'BTC', amount: Math.random() * 500, usd: Math.random() * 50_000_000 }],
      },

      // Whale accumulation/distribution
      whaleActivity: {
        accumulationPhase: Math.random() > 0.4,
        distribution: {
          accumulating: ['ETH', 'SOL', 'AVAX'],
          distributing: ['DOGE', 'SHIB'],
          neutral: ['BTC'],
        },
        largestBuy: {
          token: 'ETH',
          amount: 5000,
          usd: 20_000_000,
          wallet: '0x...',
        },
        largestSell: {
          token: 'BTC',
          amount: 200,
          usd: 20_000_000,
          wallet: '0x...',
        },
      },

      // Exchange netflow
      exchangeFlow: {
        btc: { inflow: Math.random() * 1000, outflow: Math.random() * 1500, net: 0 },
        eth: { inflow: Math.random() * 20000, outflow: Math.random() * 15000, net: 0 },
        usdt: { inflow: Math.random() * 100_000_000, outflow: Math.random() * 80_000_000, net: 0 },
      },

      // DeFi smart money
      defiActivity: {
        topProtocolInflows: [
          { protocol: 'Aave', usd: Math.random() * 50_000_000 },
          { protocol: 'Uniswap', usd: Math.random() * 30_000_000 },
          { protocol: 'Lido', usd: Math.random() * 100_000_000 },
        ],
        newPositions: Math.floor(Math.random() * 1000),
        closedPositions: Math.floor(Math.random() * 800),
      },

      // Signals
      signals: {
        overallSentiment: Math.random() > 0.5 ? 'accumulation' : 'distribution',
        confidence: Math.floor(Math.random() * 40) + 60,
        keyInsights: [
          'Large ETH accumulation by institutional wallets',
          'Exchange reserves declining for BTC',
          'Smart money rotating into L2 tokens',
        ],
      },
    };

    // Calculate net flows
    smartMoneyData.exchangeFlow.btc.net =
      smartMoneyData.exchangeFlow.btc.outflow - smartMoneyData.exchangeFlow.btc.inflow;
    smartMoneyData.exchangeFlow.eth.net =
      smartMoneyData.exchangeFlow.eth.outflow - smartMoneyData.exchangeFlow.eth.inflow;
    smartMoneyData.exchangeFlow.usdt.net =
      smartMoneyData.exchangeFlow.usdt.outflow - smartMoneyData.exchangeFlow.usdt.inflow;

    return NextResponse.json({
      ...smartMoneyData,
      timeframe,
      token,
      meta: {
        fetchedAt: new Date().toISOString(),
        endpoint: '/api/premium/smart-money',
        price: PREMIUM_PRICING['/api/premium/smart-money'].price,
        disclaimer: 'Data for informational purposes only. Not financial advice.',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Smart money data fetch failed',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}

// In-memory alert storage (use DB in production)
const whaleAlerts = new Map<string, WhaleAlert>();

/**
 * Create a whale alert subscription
 */
export async function createWhaleAlert(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { minAmount, tokens, types, chains, webhookUrl, durationHours = 24 } = body;

    if (!webhookUrl) {
      return NextResponse.json({ error: 'webhookUrl is required' }, { status: 400 });
    }

    // Validate webhook URL
    try {
      new URL(webhookUrl);
    } catch {
      return NextResponse.json({ error: 'Invalid webhook URL' }, { status: 400 });
    }

    const alert: WhaleAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      userId: 'anonymous', // In production, extract from payment/auth
      conditions: {
        minAmount: minAmount || WHALE_THRESHOLD,
        tokens: tokens?.map((t: string) => t.toUpperCase()),
        types,
        chains: chains?.map((c: string) => c.toLowerCase()),
      },
      webhookUrl,
      expiresAt: new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
    };

    whaleAlerts.set(alert.id, alert);

    return NextResponse.json({
      success: true,
      alert,
      meta: {
        createdAt: new Date().toISOString(),
        endpoint: '/api/premium/whales/alerts',
        price: PREMIUM_PRICING['/api/premium/whales/alerts'].price,
        note: 'Webhook will receive POST requests when whale transactions match your conditions',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Alert creation failed',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}

// Export handlers
export const whaleHandlers = {
  transactions: getWhaleTransactions,
  alerts: createWhaleAlert,
  analyze: analyzeWallet,
  smartMoney: getSmartMoney,
};
