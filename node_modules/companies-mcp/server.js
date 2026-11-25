#!/usr/bin/env node
/**
 * companies-mcp — MCP server for searching Indian companies by name.
 *
 * Tools:
 *   company_search — search listed Indian companies by name/ticker/sector.
 *
 * Data source: https://api.dharun.dev (no API key, no CORS issues).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

const API_URL = 'https://api.dharun.dev/v1/companies';
const MIN_QUERY_LENGTH = 2;

const TOOLS = [
  {
    name: 'company_search',
    description:
      'Search Indian (listed) companies by name, ticker, sector or industry. ' +
      'Returns a list of matching companies with their NSE ticker, company name, sector, ' +
      'industry, ISIN, currency, market cap and exchange. Use when a user asks to find a ' +
      "company, look up a stock or identify a business by name or sector.",
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search term: company name, ticker (e.g. RELIANCE), ISIN or sector (e.g. "Oil Refining"). Min ' +
            `${MIN_QUERY_LENGTH} characters.`,
        },
      },
      required: ['query'],
    },
  },
];

const server = new Server(
  { name: 'companies-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const wrap = (ok, content) => ({
    content: [{ type: 'text', text: JSON.stringify(ok, null, 2) }],
  });

  if (name === 'company_search') {
    const raw = args?.query;
    if (!raw || typeof raw !== 'string') {
      return wrap(false, [{ type: 'text', text: 'Missing required argument: query (string)' }]);
    }
    const query = raw.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      return wrap(false, [{
        type: 'text',
        text: JSON.stringify({
          error: `query too short`,
          detail: `Query must be at least ${MIN_QUERY_LENGTH} characters.`,
        }, null, 2),
      }]);
    }

    try {
      const url = `${API_URL}?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) {
        return wrap(false, [{
          type: 'text',
          text: JSON.stringify({
            error: 'API request failed',
            status: res.status,
            statusText: res.statusText,
          }, null, 2),
        }]);
      }
      const json = await res.json();
      const results = json?.data ?? [];
      return wrap(true, [{
        type: 'text',
        text: JSON.stringify({
          query,
          total: json?.meta?.total ?? results.length,
          companies: results,
        }, null, 2),
      }]);
    } catch (e) {
      return wrap(false, [{ type: 'text', text: JSON.stringify({ error: e.message }, null, 2) }]);
    }
  }

  return {
    error: `Unknown tool: ${name}`,
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('companies-mcp server running on stdio');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
