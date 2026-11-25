# india-mcp

A monorepo of **MCP (Model Context Protocol) servers for Indian data**. Each package is a standalone MCP server that lets Claude Desktop, Claude Code, and any other MCP client query Indian data — GSTIN details, PIN codes, company records, PAN validation, IRCTC train info, and UPI handles.

The goal is to be the one-stop shop for India-focused MCP servers: useful, low-competition, and easy to drop into any MCP client.

## What is MCP?

MCP is an open protocol (by Anthropic) that lets AI applications connect to external data sources and tools through a standard interface. An MCP server exposes a set of **tools**; an MCP **client** (like Claude Desktop) connects to the server and calls those tools. This repo ships one server per topic, each as its own installable package.

## Packages

| Package | Tool(s) | Data source | Auth |
|---|---|---|---|
| [`gst-mcp`](./gst-mcp) | `gst_lookup`, `gst_bulk`, `validate_gstin` | gstinapi.com (live) + local validator | Optional `GSTINAPI_KEY` |
| [`pincode-mcp`](./pincode-mcp) | `pincode_lookup` | api.dharun.dev | None |
| [`companies-mcp`](./companies-mcp) | `company_search` | api.dharun.dev | None |
| [`pan-mcp`](./pan-mcp) | `pan_validate` | Local format validation | None |
| [`irctc-mcp`](./irctc-mcp) | `station_lookup` (+ optional train/PNR) | Local station dataset / public API | None |
| [`upi-mcp`](./upi-mcp) | `upi_handle_verify` | Local format validation | None |
| [`election-mcp`](./election-mcp) | `voter_lookup`, `polling_place_lookup` | Local voter-roll sample data | None |
| [`holidays-mcp`](./holidays-mcp) | `holidays`, `holiday_types` | Local Indian-holidays dataset | None |
| [`rto-mcp`](./rto-mcp) | `rto_lookup`, `rto_by_state`, `vehicle_info`, `decode_registration` | Local RTO + vehicle dataset | None |

Each package lives in its own folder and is fully self-contained (own `package.json`, `README.md`, tests).

## Quick start

Requires **Node.js 18+**.

```bash
# From the repo root
cd gst-mcp
npm install
node server.js
```

Each package runs the same way: `cd <package> && npm install && node server.js`.

## Using with an MCP client

Add a server entry to your MCP client's config. Example for `pincode-mcp`:

```json
{
  "servers": {
    "india-pincode": {
      "command": "node",
      "args": ["C:/Users/Aditya Shah/Desktop/Code/india-mcp/pincode-mcp/server.js"]
    }
  }
}
```

Replace the path with the package you want. You can register multiple servers in the same config file.

## Tools

### `gst_lookup` (gst-mcp)
Look up any GSTIN: legal name, registration status, tax jurisdiction (state, district), FSSAI license, and registered plant addresses.

### `gst_bulk` (gst-mcp)
Validate and resolve many GSTINs in a single call.

### `validate_gstin` (gst-mcp)
Pure local GSTIN format + checksum validation — no API key, no network needed.

### `pincode_lookup` (pincode-mcp)
Return the post office(s), block, district, and state for a 6-digit PIN code.

### `company_search` (companies-mcp)
Search Indian companies by name; returns name, CIN, address, and status.

### `pan_validate` (pan-mcp)
Validate an Indian PAN (Permanent Account Number) format locally.

### `station_lookup` (irctc-mcp)
Look up an Indian railway station by code or name.

### `upi_handle_verify` (upi-mcp)
Verify the format of a UPI ID (VPA) such as `name@paytm`.

### `voter_lookup` (election-mcp)
Look up an Indian elector by name or EPIC voter ID from a sample electoral-roll dataset.

### `polling_place_lookup` (election-mcp)
Find the polling station for a given PIN code or assembly constituency.

### `holidays` (holidays-mcp)
List Indian national, state, and festival holidays for a year (optionally filtered by state or category).

### `holiday_types` (holidays-mcp)
Return the distinct categories of holidays observed in a year.

### `rto_lookup` (rto-mcp)
Look up the RTO office for a vehicle registration number.

### `rto_by_state` (rto-mcp)
List RTO offices in a state.

### `vehicle_info` (rto-mcp)
Return sample vehicle details registered with a given RTO.

### `decode_registration` (rto-mcp)
Decode an Indian vehicle registration number into state, RTO, series, and serial components.

## Development

Each package includes a test script:

```bash
cd <package>
npm test
```

## Adding more

New Indian-data MCPs are added as new folders under the repo root, each with its own `package.json`. This repo uses npm workspaces, so the root `package.json` lists every package under `workspaces`.

## Data source & licensing

- **gst-mcp** uses [gstinapi.com](https://gstinapi.com) for live data (free tier, 75 lookups/day without a key). The local validator needs no key.
- **pincode-mcp** and **companies-mcp** use [api.dharun.dev](https://api.dharun.dev) (free, no key, public data).
- **pan-mcp** and **upi-mcp** do local format validation only (no external service).
- **irctc-mcp** uses a local station dataset; see its README for details on any live data.

All data is provided "as is" by the respective providers. Use it responsibly and in accordance with each provider's terms.

This repo is open source under the [MIT License](./LICENSE).
