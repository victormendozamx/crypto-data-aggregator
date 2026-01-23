import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Documentation | Crypto Data Aggregator',
  description:
    'Complete API documentation for cryptocurrency market data. RESTful endpoints with x402 micropayment support.',
};

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1',
    description: 'API overview and pricing information',
    auth: 'None',
    price: 'Free',
    response: `{
  "name": "Crypto Data Aggregator API",
  "version": "1.0.0",
  "tiers": [...],
  "endpoints": [...]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/coins',
    description: 'List all coins with market data',
    auth: 'API Key or x402',
    price: '$0.001',
    params: [
      { name: 'page', type: 'number', default: '1', description: 'Page number' },
      {
        name: 'per_page',
        type: 'number',
        default: '100',
        description: 'Results per page (max 250)',
      },
      { name: 'order', type: 'string', default: 'market_cap_desc', description: 'Sort order' },
    ],
    response: `{
  "success": true,
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "current_price": 45000,
      "market_cap": 850000000000,
      ...
    }
  ],
  "meta": { "page": 1, "perPage": 100 }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/coin/:coinId',
    description: 'Get detailed data for a single coin',
    auth: 'API Key or x402',
    price: '$0.002',
    params: [
      {
        name: 'coinId',
        type: 'string',
        required: true,
        description: 'Coin ID (e.g., bitcoin, ethereum)',
      },
    ],
    response: `{
  "success": true,
  "data": {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "market_data": {...},
    "description": "...",
    ...
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/market-data',
    description: 'Global market statistics and trending coins',
    auth: 'API Key or x402',
    price: '$0.002',
    response: `{
  "success": true,
  "data": {
    "global": {
      "total_market_cap": {...},
      "total_volume": {...},
      "market_cap_percentage": {...}
    },
    "trending": [...]
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/export',
    description: 'Bulk data export in JSON or CSV format',
    auth: 'API Key or x402',
    price: '$0.01',
    params: [
      {
        name: 'format',
        type: 'string',
        default: 'json',
        description: 'Export format: json or csv',
      },
      { name: 'type', type: 'string', default: 'coins', description: 'Data type: coins or defi' },
      { name: 'limit', type: 'number', default: '100', description: 'Number of records (max 500)' },
    ],
    response: 'JSON object or CSV file download',
  },
];

const errorCodes = [
  { code: 400, name: 'Bad Request', description: 'Invalid parameters provided' },
  { code: 401, name: 'Unauthorized', description: 'Invalid or missing API key' },
  { code: 402, name: 'Payment Required', description: 'x402 payment needed for this request' },
  { code: 404, name: 'Not Found', description: 'Resource not found' },
  { code: 429, name: 'Too Many Requests', description: 'Rate limit exceeded' },
  { code: 500, name: 'Server Error', description: 'Internal server error' },
];

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black dark:text-white mb-4">API Documentation</h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-400">
            RESTful API for cryptocurrency market data with x402 micropayment support.
          </p>
        </div>

        {/* Base URL */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Base URL</h2>
          <code className="block p-4 bg-neutral-100 dark:bg-black rounded-lg font-mono text-sm text-black dark:text-white">
            https://cryptodata.example.com/api/v1
          </code>
        </section>

        {/* Authentication */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Authentication</h2>
          <div className="space-y-4">
            <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <h3 className="font-medium text-black dark:text-white mb-2">Option 1: API Key</h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                Include your API key in the request header or query parameter.
              </p>
              <code className="block p-3 bg-neutral-100 dark:bg-black rounded font-mono text-sm text-black dark:text-white">
                curl -H &quot;X-API-Key: your_api_key&quot; https://api.example.com/v1/coins
              </code>
            </div>

            <div className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <h3 className="font-medium text-black dark:text-white mb-2">
                Option 2: x402 Micropayments
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mb-3">
                Pay per request using USDC on Base. No subscription needed.
              </p>
              <ol className="list-decimal list-inside space-y-2 text-neutral-600 dark:text-neutral-400 text-sm">
                <li>Make request, receive 402 with payment requirement</li>
                <li>Send USDC to the provided address on Base</li>
                <li>
                  Include tx hash in header:{' '}
                  <code className="bg-neutral-100 dark:bg-black px-1 rounded">
                    X-Payment-Proof: {`{"txHash": "0x..."}`}
                  </code>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* Endpoints */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Endpoints</h2>
          <div className="space-y-8">
            {endpoints.map((endpoint) => (
              <div
                key={endpoint.path}
                className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden"
              >
                <div className="p-4 bg-neutral-50 dark:bg-black border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded">
                      {endpoint.method}
                    </span>
                    <code className="font-mono text-black dark:text-white">{endpoint.path}</code>
                    <span className="ml-auto text-sm text-neutral-500">{endpoint.price}</span>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                    {endpoint.description}
                  </p>
                </div>

                <div className="p-4">
                  {endpoint.params && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-neutral-500 mb-2">Parameters</h4>
                      <table className="w-full text-sm">
                        <tbody>
                          {endpoint.params.map((param) => (
                            <tr
                              key={param.name}
                              className="border-b border-neutral-100 dark:border-neutral-900"
                            >
                              <td className="py-2 pr-4">
                                <code className="text-black dark:text-white">{param.name}</code>
                                {'required' in param && param.required && (
                                  <span className="ml-2 text-xs text-red-600">required</span>
                                )}
                              </td>
                              <td className="py-2 pr-4 text-neutral-500">{param.type}</td>
                              <td className="py-2 text-neutral-600 dark:text-neutral-400">
                                {param.description}
                                {'default' in param && (
                                  <span className="ml-2 text-neutral-400">
                                    (default: {param.default})
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-neutral-500 mb-2">Response</h4>
                    <pre className="p-3 bg-neutral-100 dark:bg-black rounded text-xs font-mono text-black dark:text-white overflow-x-auto">
                      {endpoint.response}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Error Codes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Error Codes</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800">
                <th className="text-left py-3 pr-4 text-neutral-500 font-medium">Code</th>
                <th className="text-left py-3 pr-4 text-neutral-500 font-medium">Name</th>
                <th className="text-left py-3 text-neutral-500 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              {errorCodes.map((error) => (
                <tr
                  key={error.code}
                  className="border-b border-neutral-100 dark:border-neutral-900"
                >
                  <td className="py-3 pr-4 font-mono text-black dark:text-white">{error.code}</td>
                  <td className="py-3 pr-4 text-black dark:text-white">{error.name}</td>
                  <td className="py-3 text-neutral-600 dark:text-neutral-400">
                    {error.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Rate Limits */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">Rate Limits</h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Rate limits are enforced per API key. Check response headers for current status:
          </p>
          <div className="p-4 bg-neutral-100 dark:bg-black rounded-lg font-mono text-sm space-y-1 text-black dark:text-white">
            <div>X-RateLimit-Limit: 10000</div>
            <div>X-RateLimit-Remaining: 9542</div>
            <div>X-RateLimit-Reset: 1706054400</div>
          </div>
        </section>

        {/* SDKs */}
        <section>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-4">SDKs & Examples</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {['JavaScript', 'Python', 'Go', 'PHP', 'TypeScript', 'React'].map((lang) => (
              <div
                key={lang}
                className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg hover:border-black dark:hover:border-white transition-colors cursor-pointer"
              >
                <span className="text-black dark:text-white font-medium">{lang}</span>
                <span className="block text-sm text-neutral-500 mt-1">View SDK →</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
