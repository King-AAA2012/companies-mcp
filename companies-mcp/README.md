# companies-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for **searching Indian companies**. It lets Claude Code, Claude Desktop, Cline, and any other MCP client search for listed Indian companies by name, ticker, sector or industry.

## What it does

One tool:

| Tool | Description | Needs API key? |
| --- | --- | --- |
| `company_search` | Search listed Indian companies by name, ticker, ISIN or sector. Returns NSE ticker, company name, sector, industry, ISIN, currency, market cap and exchange. | No |

`company_search` hits the free, keyless [api.dharun.dev](https://api.dharun.dev) index of Indian listed companies. No API key, no sign-up, no CORS issues.

## Quick start

```bash
npm install
npm start
```

That starts the server on stdio (the default transport, recommended for local use). Point your MCP client at it:

```json
{
  "mcpServers": {
    "companies": {
      "command": "node",
      "args": ["C:/Users/Aditya Shah/Desktop/Code/companies-mcp/server.js"]
    }
  }
}
```

> Tip: on Windows, write the absolute path with forward slashes (`C:/...`) or quote it.

### Using it in Claude Code / Claude Desktop

Once connected, you can ask things like:

- *"Find Reliance Industries"* → uses `company_search` with query `Reliance`
- *"What sector is TCS in?"* → uses `company_search` with query `TCS`
- *"List oil refining companies"* → uses `company_search` with query `Oil Refining`

## Tool: company_search

Arguments:

| Arg | Type | Required | Notes |
| --- | --- | --- | --- |
| `query` | string | Yes | Company name, ticker (e.g. `RELIANCE`), ISIN or sector. Min 2 characters. |

Example:

```json
{ "name": "company_search", "arguments": { "query": "Reliance" } }
```

Returns:

```json
{
  "query": "Reliance",
  "total": 7,
  "companies": [
    {
      "id": "NSE:RELIANCE",
      "exchange": "NSE",
      "ticker": "RELIANCE",
      "company": "Reliance Industries Limited",
      "sector": "Energy Minerals",
      "industry": "Oil Refining/Marketing",
      "isin": "INE002A01018",
      "currency": "INR",
      "marketCap": 15913588649778,
      "listed": true
    }
  ]
}
```

Each company carries its `exchange`, `ticker`, `company` name, `sector`, `industry`, `isin`, `currency`, `marketCap`, `oneLine` summary and logo link.

## Data source & licensing

Live data is provided by the free, keyless [api.dharun.dev](https://api.dharun.dev) index of Indian listed companies (`GET https://api.dharun.dev/v1/companies?q={query}`). Attribution: company logos and trademarks belong to their respective owners.

This project is licensed MIT.

## Development

```bash
npm test          # unit + live search tests
npm run dev       # run the MCP server on stdio
npm start         # same as dev
```

The tests cover the query guard (min length / missing / empty) and, when network is available, a live search against api.dharun.dev. Live tests are skipped automatically when the machine is offline.

## Project layout

```
companies-mcp/
├── server.js            # MCP server: company_search tool + stdio transport
├── scripts/
│   └── test.mjs         # Tests (npm test)
├── .gitignore
├── LICENSE
└── package.json
```
