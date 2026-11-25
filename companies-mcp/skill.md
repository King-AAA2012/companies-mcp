---
name: companies-mcp
version: 0.1.0
description: MCP server for searching Indian (listed) companies by name, ticker, sector or industry. Lets Claude and other AI tools look up company names, NSE tickers, sectors, industries, ISINs and market caps.
author: King-AAA2012
license: MIT
---

# companies-mcp â€” Skill

A single MCP (Model Context Protocol) server for Indian data. It lets Claude
Desktop, Claude Code, Cline, or any other MCP client call tools backed by real
Indian data.


## Tools

  | `company_search` | Search listed Indian companies by name, ticker, ISIN or sector. Returns NSE ticker, company name, sector, industry, ISIN, currency, market cap and exchange. | No |

## Requirements
- **Node.js 18+
- **Internet connection required.** `company_search` hits the free, keyless [api.dharun.dev](https://api.dharun.dev) index of Indian listed companies. No API key, no sign-up.

## How to Install / Run

```bash
npm install
node server.js      # boots the MCP server over stdio
```

### Register with an MCP client

Add a server entry to your MCP client config JSON:

```json
{
  "mcpServers": {
    "companies-mcp": {
      "command": "node",
      "args": ["C:/Users/Aditya Shah/Desktop/Code/companies-mcp/server.js"]
    }
  }
}
```

## How to Verify (Tests)

```bash
npm test
```

## Selling / Redistributing

This skill is provided under MIT, so it may be sold or redistributed. Ship it
as its own zip (companies-mcp-0.1.0.zip) in the packages/ folder alongside the other
india-mcp packages.

