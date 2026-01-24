/**
 * Additional Free Data Sources
 * 
 * New integrations for 2026 - all 100% FREE APIs
 * 
 * @module additional-sources
 */

// =============================================================================
// CRYPTOCOMPARE - Historical OHLCV Data
// =============================================================================

const CRYPTOCOMPARE_BASE = 'https://min-api.cryptocompare.com/data';

export interface OHLCVData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volumefrom: number;
  volumeto: number;
}

/**
 * Get historical OHLCV data from CryptoCompare (FREE, no API key needed for basic)
 */
export async function getHistoricalOHLCV(
  symbol: string,
  currency: string = 'USD',
  limit: number = 30,
  aggregate: number = 1,
  type: 'histoday' | 'histohour' | 'histominute' = 'histoday'
): Promise<OHLCVData[]> {
  const url = `${CRYPTOCOMPARE_BASE}/${type}?fsym=${symbol}&tsym=${currency}&limit=${limit}&aggregate=${aggregate}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 300 }, // Cache 5 minutes
  });
  
  if (!response.ok) throw new Error('CryptoCompare fetch failed');
  
  const data = await response.json();
  return data.Data || [];
}

/**
 * Get social stats from CryptoCompare (FREE)
 */
export async function getSocialStats(coinId: number): Promise<{
  twitter: { followers: number; posts: number };
  reddit: { subscribers: number; activeUsers: number };
  github: { stars: number; forks: number };
}> {
  const url = `${CRYPTOCOMPARE_BASE}/social/coin/latest?coinId=${coinId}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 }, // Cache 1 hour
  });
  
  if (!response.ok) throw new Error('Social stats fetch failed');
  
  const data = await response.json();
  const social = data.Data || {};
  
  return {
    twitter: {
      followers: social.Twitter?.followers || 0,
      posts: social.Twitter?.statuses || 0,
    },
    reddit: {
      subscribers: social.Reddit?.subscribers || 0,
      activeUsers: social.Reddit?.active_users || 0,
    },
    github: {
      stars: social.CodeRepository?.List?.[0]?.stars || 0,
      forks: social.CodeRepository?.List?.[0]?.forks || 0,
    },
  };
}

// =============================================================================
// BLOCKCHAIN.COM - Bitcoin On-Chain Stats
// =============================================================================

const BLOCKCHAIN_BASE = 'https://api.blockchain.info';

export interface BlockchainStats {
  marketPrice: number;
  hashRate: number;
  difficulty: number;
  totalBitcoins: number;
  numberOfTransactions: number;
  minutesBetweenBlocks: number;
  totalFeesBTC: number;
}

/**
 * Get Bitcoin blockchain stats (FREE, no API key)
 */
export async function getBitcoinStats(): Promise<BlockchainStats> {
  const url = `${BLOCKCHAIN_BASE}/stats?format=json`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 600 }, // Cache 10 minutes
  });
  
  if (!response.ok) throw new Error('Blockchain.com fetch failed');
  
  const data = await response.json();
  
  return {
    marketPrice: data.market_price_usd,
    hashRate: data.hash_rate,
    difficulty: data.difficulty,
    totalBitcoins: data.totalbc / 100000000, // Satoshis to BTC
    numberOfTransactions: data.n_tx,
    minutesBetweenBlocks: data.minutes_between_blocks,
    totalFeesBTC: data.total_fees_btc / 100000000,
  };
}

/**
 * Get current Bitcoin block height (FREE)
 */
export async function getBitcoinBlockHeight(): Promise<number> {
  const url = `${BLOCKCHAIN_BASE}/q/getblockcount`;
  
  const response = await fetch(url, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error('Block height fetch failed');
  
  const text = await response.text();
  return parseInt(text, 10);
}

// =============================================================================
// MESSARI - Research Data (FREE tier: 20 requests/minute)
// =============================================================================

const MESSARI_BASE = 'https://data.messari.io/api/v1';

export interface MessariAsset {
  id: string;
  symbol: string;
  name: string;
  slug: string;
  metrics: {
    marketcap: { current_marketcap_usd: number };
    supply: { circulating: number; max: number | null };
    allTimeHigh: { price: number; at: string };
    roiData: { percent_change_last_1_week: number };
  };
  profile: {
    tagline: string;
    overview: string;
    category: string;
    sector: string;
  };
}

/**
 * Get asset metrics from Messari (FREE)
 */
export async function getMessariAsset(symbol: string): Promise<MessariAsset | null> {
  const url = `${MESSARI_BASE}/assets/${symbol.toLowerCase()}/metrics`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 300 },
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  return data.data;
}

/**
 * Get all assets from Messari (FREE)
 */
export async function getMessariAssets(limit: number = 20): Promise<MessariAsset[]> {
  const url = `${MESSARI_BASE}/assets?limit=${limit}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 600 },
  });
  
  if (!response.ok) throw new Error('Messari fetch failed');
  
  const data = await response.json();
  return data.data || [];
}

// =============================================================================
// COINGLASS - Futures & Funding Rates (FREE public endpoints)
// =============================================================================

const COINGLASS_BASE = 'https://open-api.coinglass.com/public/v2';

export interface FundingRate {
  symbol: string;
  rate: number;
  predictedRate: number;
  exchange: string;
  nextFundingTime: number;
}

/**
 * Get funding rates across exchanges (FREE)
 */
export async function getFundingRates(symbol: string = 'BTC'): Promise<FundingRate[]> {
  const url = `${COINGLASS_BASE}/funding?symbol=${symbol}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 300 },
  });
  
  if (!response.ok) return [];
  
  const data = await response.json();
  if (data.code !== '0') return [];
  
  return (data.data || []).map((item: Record<string, unknown>) => ({
    symbol: item.symbol,
    rate: item.rate,
    predictedRate: item.predictedRate,
    exchange: item.exchangeName,
    nextFundingTime: item.nextFundingTime,
  }));
}

/**
 * Get open interest data (FREE)
 */
export async function getOpenInterest(symbol: string = 'BTC'): Promise<{
  totalOpenInterest: number;
  openInterestChange24h: number;
  exchanges: { name: string; openInterest: number; change24h: number }[];
}> {
  const url = `${COINGLASS_BASE}/open_interest?symbol=${symbol}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 300 },
  });
  
  if (!response.ok) throw new Error('CoinGlass OI fetch failed');
  
  const data = await response.json();
  const oiData = data.data || [];
  
  const totalOI = oiData.reduce((sum: number, ex: { openInterest: number }) => sum + (ex.openInterest || 0), 0);
  
  return {
    totalOpenInterest: totalOI,
    openInterestChange24h: 0, // Calculate from historical
    exchanges: oiData.map((ex: Record<string, unknown>) => ({
      name: ex.exchangeName,
      openInterest: ex.openInterest,
      change24h: ex.openInterestChange24h || 0,
    })),
  };
}

// =============================================================================
// GOPLUS LABS - Token Security Data (FREE)
// =============================================================================

const GOPLUS_BASE = 'https://api.gopluslabs.io/api/v1';

export interface TokenSecurity {
  isOpenSource: boolean;
  isProxy: boolean;
  isMintable: boolean;
  isHoneypot: boolean;
  buyTax: number;
  sellTax: number;
  holderCount: number;
  lpHolderCount: number;
  isAntiWhale: boolean;
  isBlacklisted: boolean;
  trustScore: number; // 0-100, calculated
}

/**
 * Get token security info (FREE, no API key)
 */
export async function getTokenSecurity(
  chainId: string,
  contractAddress: string
): Promise<TokenSecurity | null> {
  const url = `${GOPLUS_BASE}/token_security/${chainId}?contract_addresses=${contractAddress}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 }, // Cache 1 hour
  });
  
  if (!response.ok) return null;
  
  const data = await response.json();
  const result = data.result?.[contractAddress.toLowerCase()];
  
  if (!result) return null;
  
  // Calculate trust score
  let trustScore = 100;
  if (result.is_honeypot === '1') trustScore -= 50;
  if (result.is_proxy === '1') trustScore -= 10;
  if (result.is_mintable === '1') trustScore -= 15;
  if (result.is_open_source !== '1') trustScore -= 20;
  if (parseFloat(result.buy_tax || '0') > 0.1) trustScore -= 10;
  if (parseFloat(result.sell_tax || '0') > 0.1) trustScore -= 10;
  
  return {
    isOpenSource: result.is_open_source === '1',
    isProxy: result.is_proxy === '1',
    isMintable: result.is_mintable === '1',
    isHoneypot: result.is_honeypot === '1',
    buyTax: parseFloat(result.buy_tax || '0') * 100,
    sellTax: parseFloat(result.sell_tax || '0') * 100,
    holderCount: parseInt(result.holder_count || '0', 10),
    lpHolderCount: parseInt(result.lp_holder_count || '0', 10),
    isAntiWhale: result.is_anti_whale === '1',
    isBlacklisted: result.is_blacklisted === '1',
    trustScore: Math.max(0, trustScore),
  };
}

// =============================================================================
// ETHERSCAN - Ethereum Gas & Stats (FREE tier: 5 calls/sec)
// =============================================================================

const ETHERSCAN_BASE = 'https://api.etherscan.io/api';

export interface GasOracle {
  safeGasPrice: number;
  proposeGasPrice: number;
  fastGasPrice: number;
  suggestBaseFee: number;
  gasUsedRatio: string;
}

/**
 * Get Ethereum gas prices (FREE, no API key for basic)
 */
export async function getEthGasOracle(): Promise<GasOracle> {
  const url = `${ETHERSCAN_BASE}?module=gastracker&action=gasoracle`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 15 }, // Cache 15 seconds
  });
  
  if (!response.ok) throw new Error('Etherscan gas oracle failed');
  
  const data = await response.json();
  const result = data.result;
  
  return {
    safeGasPrice: parseInt(result.SafeGasPrice, 10),
    proposeGasPrice: parseInt(result.ProposeGasPrice, 10),
    fastGasPrice: parseInt(result.FastGasPrice, 10),
    suggestBaseFee: parseFloat(result.suggestBaseFee),
    gasUsedRatio: result.gasUsedRatio,
  };
}

/**
 * Get ETH supply stats (FREE)
 */
export async function getEthSupply(): Promise<{
  totalSupply: number;
  ethSupply: number;
  eth2Staking: number;
  burntFees: number;
}> {
  const url = `${ETHERSCAN_BASE}?module=stats&action=ethsupply2`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 3600 },
  });
  
  if (!response.ok) throw new Error('Etherscan supply failed');
  
  const data = await response.json();
  const result = data.result;
  
  return {
    totalSupply: parseFloat(result.EthSupply) / 1e18,
    ethSupply: parseFloat(result.EthSupply) / 1e18,
    eth2Staking: parseFloat(result.Eth2Staking || '0') / 1e18,
    burntFees: parseFloat(result.BurntFees || '0') / 1e18,
  };
}

// =============================================================================
// UNLOCKS.APP - Token Vesting Data (FREE public API)
// =============================================================================

export interface TokenUnlock {
  project: string;
  symbol: string;
  unlockDate: string;
  unlockAmount: number;
  unlockValueUSD: number;
  percentOfSupply: number;
  category: 'team' | 'investor' | 'ecosystem' | 'other';
}

/**
 * Get upcoming token unlocks (mock - real API requires key)
 */
export async function getUpcomingUnlocks(days: number = 30): Promise<TokenUnlock[]> {
  // Note: Real implementation would use unlocks.app API
  // This is a placeholder showing the data structure
  return [
    {
      project: 'Arbitrum',
      symbol: 'ARB',
      unlockDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      unlockAmount: 92650000,
      unlockValueUSD: 120000000,
      percentOfSupply: 0.92,
      category: 'team',
    },
    {
      project: 'Optimism',
      symbol: 'OP',
      unlockDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      unlockAmount: 24160000,
      unlockValueUSD: 85000000,
      percentOfSupply: 0.56,
      category: 'investor',
    },
  ];
}

// =============================================================================
// EXPORT ALL
// =============================================================================

export const additionalSources = {
  // CryptoCompare
  getHistoricalOHLCV,
  getSocialStats,
  
  // Blockchain.com
  getBitcoinStats,
  getBitcoinBlockHeight,
  
  // Messari
  getMessariAsset,
  getMessariAssets,
  
  // CoinGlass
  getFundingRates,
  getOpenInterest,
  
  // GoPlus Labs
  getTokenSecurity,
  
  // Etherscan
  getEthGasOracle,
  getEthSupply,
  
  // Token Unlocks
  getUpcomingUnlocks,
};

export default additionalSources;
