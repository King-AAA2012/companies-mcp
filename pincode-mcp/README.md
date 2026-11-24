# pincode-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for **Indian PIN code lookups**. It lets Claude Code, Claude Desktop, Cline, and any other MCP client resolve a 6-digit Indian PIN code (Postal Index Number) to the offices it serves, its district, state and country.

A PIN code is the 6-digit postal code used by India Post. The first two digits mark the state/region, the last three identify the delivery office.

## What it does

One tool:

- **`pincode_lookup`** — resolves a 6-digit Indian PIN code to location details (post offices, district, state, country).

## Quick start

Requires **Node.js 18+** (uses the built-in global `fetch`). No API key is needed.

```bash
# from the monorepo root
npm install          # installs @modelcontextprotocol/sdk
npm run test --workspace pincode-mcp   # run the tests
```

Run the server directly (stdio transport):

```bash
node server.js
```

## MCP client configuration

Add it to your MCP client's configuration as a stdio server:

```json
{
  "mcpServers": {
    "pincode": {
      "command": "node",
      "args": ["/absolute/path/to/india-mcp/pincode-mcp/server.js"]
    }
  }
}
```

Or, from inside the package folder:

```json
{
  "mcpServers": {
    "pincode": {
      "command": "node",
      "args": ["server.js"]
    }
  }
}
```

## Tool examples

**`pincode_lookup`** — arguments:

| argument | type | required | description |
| --- | --- | --- | --- |
| `pincode` | string | yes | 6-digit Indian PIN code, e.g. `560001` |

Example call:

```json
{ "name": "pincode_lookup", "arguments": { "pincode": "560001" } }
```

Example response (trimmed):

```json
{
  "ok": true,
  "data": {
    "pincode": "560001",
    "district": "Bengaluru Urban",
    "stateCode": "KA",
    "state": "Karnataka",
    "country": "India",
    "offices": [
      {
        "name": "Bengaluru G.P.O.",
        "type": "Head Office",
        "delivery": true,
        "division": "Bangalore Gpo Division",
        "region": "Bengaluru Hq",
        "circle": "Karnataka",
        "district": "Bengaluru Urban",
        "stateCode": "KA",
        "state": "Karnataka",
        "latitude": 12.971599,
        "longitude": 77.594563
      }
    ]
  }
}
```

An invalid PIN (anything other than 6 digits) is rejected locally:

```json
{ "name": "pincode_lookup", "arguments": { "pincode": "12345" } }
```

```json
{
  "ok": false,
  "error": "pincode must be exactly 6 digits"
}
```

## Data source

Data is fetched from **https://api.dharun.dev** (free, no API key, CORS allowed):

```
GET https://api.dharun.dev/v1/pincode/{pincode}
```

This API draws on the **Government Open Data of India — "All India Pincode Directory"** (Department of Posts), published on [data.gov.in](https://www.data.gov.in) under the Government Open Data License (GODL). Pin codes are validated against this directory; an unknown pin code returns a 404 with a descriptive error.

## Scripts

| script | description |
| --- | --- |
| `npm start` | run the server (`node server.js`) |
| `npm run dev` | run the server (`node server.js`) |
| `npm test` | run the tests (`node scripts/test.mjs`) |

## License

[MIT](./LICENSE)
