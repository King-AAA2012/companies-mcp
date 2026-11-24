#!/usr/bin/env node
/**
 * gst-mcp — MCP server for Indian GSTIN verification.
 *
 * Tools:
 *   gst_lookup   — legal name, status, tax jurisdiction, FSSAI, plant addresses
 *   gst_bulk     — validate + resolve many GSTINs in one call
 *   validate_gstin — pure local format + checksum validation (no key needed)
 *
 * Data source: gstinapi.com (free tier, requires GSTINAPI_KEY).
 * Local validation works with no key at all.
 */

import 'dotenv/config';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { validateGstin, fetchTaxpayerInfo } from './lib/gstin.js';

const API_KEY = process.env.GSTINAPI_KEY || '';

const TOOLS = [
  {
    name: 'gst_lookup',
    description:
      'Look up a GSTIN (GST & Services Tax registration number) for a business in India. ' +
      'Returns the legal registered name, registration status, date of registration, tax jurisdiction ' +
      '(address, state, jurisdiction code/name), FSSAI license number, and plant addresses. ' +
      'Use when a user asks to verify a business, check if a GSTIN is active, or find a company\'s registered address.',
    inputSchema: {
      type: 'object',
      properties: {
        gstin: {
          type: 'string',
          description: '15-character GSTIN, e.g. 29ABCPD1234C1Z5 (state code 00-36).',
        },
      },
      required: ['gstin'],
    },
  },
  {
    name: 'gst_bulk',
    description:
      'Validate and resolve many GSTINs at once (e.g. a list of vendor GSTINs from an invoice sheet). ' +
      'Each entry gets local validation plus, when a key is configured, a lookup. Returns a per-entry result.',
    inputSchema: {
      type: 'object',
      properties: {
        gstins: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of GSTIN strings.',
        },
      },
      required: ['gstin'],
    },
  },
  {
    name: 'validate_gstin',
    description:
      'Validate a GSTIN locally without any API key: checks the 15-character format, PAN pattern, ' +
      'state code (00-36) and registration number. Returns valid/invalid plus parsed fields. ' +
      'Use as a fast pre-check before a paid lookup.',
    inputSchema: {
      type: 'object',
      properties: {
        gstin: {
          type: 'string',
          description: '15-character GSTIN to validate.',
        },
      },
      required: ['gstin'],
    },
  },
];

const server = new Server(
  { name: 'gst-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  const wrap = (ok, content) => ({
    content: [{ type: 'text', text: JSON.stringify(ok, null, 2) }],
  });

  if (name === 'validate_gstin') {
    const raw = args?.gstin;
    if (!raw) {
      return wrap(false, [{ type: 'text', text: 'Missing required argument: gstin' }]);
    }
    return wrap(true, [{ type: 'text', text: JSON.stringify(validateGstin(raw), null, 2) }]);
  }

  if (name === 'gst_lookup') {
    const raw = args?.gstin;
    if (!raw) {
      return wrap(false, [{ type: 'text', text: 'Missing required argument: gstin' }]);
    }
    const v = validateGstin(raw);
    if (!v.valid) {
      return wrap(false, [{ type: 'text', text: JSON.stringify(v, null, 2) }]);
    }
    if (!API_KEY) {
      return wrap(false, [{
        type: 'text',
        text: JSON.stringify({
          ...v,
          note: 'Format is valid. Set GSTINAPI_KEY to fetch live company data.',
        }, null, 2),
      }]);
    }
    try {
      const data = await fetchTaxpayerInfo(v.gstin, API_KEY);
      return wrap(true, [{ type: 'text', text: JSON.stringify(data, null, 2) }]);
    } catch (e) {
      return wrap(false, [{ type: 'text', text: JSON.stringify({ error: e.message }, null, 2) }]);
    }
  }

  if (name === 'gst_bulk') {
    const list = args?.gstin || args?.gstins;
    if (!Array.isArray(list)) {
      return wrap(false, [{ type: 'text', text: 'Missing required argument: gstins (array)' }]);
    }
    const results = [];
    for (const raw of list) {
      const v = validateGstin(raw);
      if (!v.valid) {
        results.push({ gstin: raw, ...v });
        continue;
      }
      if (!API_KEY) {
        results.push({ gstin: v.gstin, ...v, note: 'No key configured for live lookup' });
        continue;
      }
      try {
        const data = await fetchTaxpayerInfo(v.gstin, API_KEY);
        results.push({ gstin: v.gstin, ...v, taxpayer_data: data });
      } catch (e) {
        results.push({ gstin: v.gstin, ...v, error: e.message });
      }
    }
    return wrap(true, [{ type: 'text', text: JSON.stringify(results, null, 2) }]);
  }

  return {
    error: `Unknown tool: ${name}`,
    content: [{ type: 'text', text: `Unknown tool: ${name}` }],
  };
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('gst-mcp server running on stdio');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
