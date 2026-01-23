# API Overview

The Crypto Data Aggregator API provides real-time cryptocurrency market data with flexible
authentication options.

## Base URL

```
https://your-domain.com/api
```

For local development:

```
http://localhost:3000/api
```

## Authentication

The API supports three authentication methods:

| Method           | Use Case            | Rate Limit    |
| ---------------- | ------------------- | ------------- |
| **API Key**      | Subscription access | Based on tier |
| **x402 Payment** | Pay-per-use         | Unlimited     |
| **No Auth**      | Free tier           | 100 req/day   |

See [Authentication](authentication.md) for details.

## Endpoints

### Free Endpoints

| Method | Endpoint         | Description         |
| ------ | ---------------- | ------------------- |
| `GET`  | `/api/market`    | Global market stats |
| `GET`  | `/api/trending`  | Trending coins      |
| `GET`  | `/api/news`      | Latest crypto news  |
| `GET`  | `/api/sentiment` | Market sentiment    |

### Premium Endpoints

| Method | Endpoint                          | Price  | Description        |
| ------ | --------------------------------- | ------ | ------------------ |
| `GET`  | `/api/premium/market/coins`       | $0.001 | Extended coin data |
| `GET`  | `/api/premium/market/history`     | $0.005 | Historical data    |
| `POST` | `/api/premium/analytics/screener` | $0.01  | Advanced screener  |
| `GET`  | `/api/premium/export/portfolio`   | $0.10  | Portfolio export   |
| `POST` | `/api/premium/ai/analyze`         | $0.05  | AI analysis        |

## Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-01-23T12:00:00Z",
    "cached": false
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Status Codes

| Code  | Description             |
| ----- | ----------------------- |
| `200` | Success                 |
| `400` | Bad Request             |
| `401` | Unauthorized            |
| `402` | Payment Required (x402) |
| `429` | Rate Limit Exceeded     |
| `500` | Server Error            |

## Quick Example

```bash
# Get trending coins (free)
curl https://your-domain.com/api/trending

# Get premium data with API key
curl -H "X-API-Key: pro_xxxxx" \
  https://your-domain.com/api/premium/market/coins

# Get premium data with x402 payment
curl -H "X-PAYMENT: <base64-payment>" \
  https://your-domain.com/api/premium/market/coins
```

## Next Steps

- [Authentication](authentication.md) - Set up API access
- [Market Data](market-data.md) - Endpoint details
- [x402 Payments](x402.md) - Micropayment guide
