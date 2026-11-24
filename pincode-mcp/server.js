#!/usr/bin/env node
/**
 * pincode-mcp — MCP server for Indian PIN code lookups.
 *
 * Tools:
 *   pincode_lookup — resolve a 6-digit Indian PIN code to post offices,
 *                    district, state and country.
 *
 * Data source: https://api.dharun.dev (free, no API key, CORS allowed),
 * sourced from the Government Open Data of India "All India Pincode Directory".
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { validatePincode, fetchPincode } from './lib/pincode.js';

const TOOLS = [
  {
    name: 'pincode_lookup',
    description:
      'Look up a 6-digit Indian PIN code (Postal Index Number) and return the ' +
      'offices it serves, the district, state and country. Use when a user needs ' +
      'the location for a PIN code, e.g. "Where is PIN code 560001?".',
    inputSchema: {
      type: 'object',
      properties: {
        pincode: {
          type: 'string',
          description: '6-digit Indian PIN code, e.g. 560001 (Bengaluru).',
        },
      },
      required: ['pincode'],
    },
  },
];

const server = new Server(
  { name: 'pincode-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const wrap = (ok, content) => ({
    content: [{ type: 'text', text: JSON.stringify(ok, null, 2) }],
  });

  if (name === 'pincode_lookup') {
    const raw = args?.pincode;
    if (!raw) {
      return wrap(false, [{ type: 'text', text: 'Missing required argument: pincode' }]);
    }
    const v = validatePincode(raw);
    if (!v.valid) {
      return wrap(false, [{ type: 'text', text: JSON.stringify(v, null, 2) }]);
    }
    try {
      const data = await fetchPincode(v.pincode);
      return wrap(true, [{ type: 'text', text: JSON.stringify(data, null, 2) }]);
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
  console.error('pincode-mcp server running on stdio');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
