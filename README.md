# gst-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for **Indian GSTIN data**. It lets Claude Code, Claude Desktop, Cline, and any other MCP client validate and look up Indian GST Identification Numbers (GSTINs).

A GSTIN is the 15-character tax ID used for India's Goods and Services Tax — e.g. `27AAACR5055K1Z7`. This server fills a real gap: there are few MCP servers for Indian data, and GSTIN verification is high-intent for AI coding and research agents.

## What it does

Three tools:

| Tool | Description | Needs API key? |
| --- | --- | --- |
| `validate_gstin` | Pure local format + checksum validation. Works offline, no key. | No |
| `gst_lookup` | Live lookup: legal name, registration status, tax jurisdiction, FSSAI license, and registered plant addresses. | Yes (`GSTINAPI_KEY`) |
| `gst_bulk` | Validate and resolve many GSTINs in a single call. | Yes (`GSTINAPI_KEY`) |

`validate_gstin` is fully offline — it checks the GSTIN structure and its modulus-36 check digit with no network call, so it always works. `gst_lookup` and `gst_bulk` fetch live registration data from [gstinapi.com](https://gstinapi.com).

## Quick start

```bash
npm install
npm start
```

That starts the server on stdio (the default transport, recommended for local use). Point your MCP client at it:

```json
{
  "mcpServers": {
    "gst": {
      "command": "node",
      "args": ["C:/Users/Aditya Shah/Desktop/Code/gst-mcp/server.js"]
    }
  }
}
```

> Tip: on Windows, write the absolute path with forward slashes (`C:/...`) or quote it.

### Using it in Claude Code / Claude Desktop

Once connected, you can ask things like:

- *"Is `27AAACR5055K1Z7` a valid GSTIN?"* → uses `validate_gstin`
- *"What's the legal name and jurisdiction for `29AAACI1195H1ZI`?"* → uses `gst_lookup`

## Live data (gst_lookup / gst_bulk)

Live lookups need a free `GSTINAPI_KEY` from [gstinapi.com](https://gstinapi.com) (free tier: 75 lookups/day, no credit card).

1. Get a key at https://gstinapi.com.
2. Create a `.env` file in this folder:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and paste your key:

   ```dotenv
   GSTINAPI_KEY=your-key-here
   ```

4. Restart the server. Without a key, `validate_gstin` still works, but `gst_lookup` and `gst_bulk` return a clear "key not set" error.

## Examples

### validate_gstin

```json
{ "name": "validate_gstin", "arguments": { "gstin": "27AAACR5055K1Z7" } }
```

```json
{
  "valid": true,
  "parsed": {
    "gstin": "27AAACR5055K1Z7",
    "stateCode": "27",
    "stateName": "Maharashtra",
    "pan": "AAACR5055K",
    "entityCode": "1",
    "checkChar": "7"
  }
}
```

The validator is strict: it rejects wrong lengths, non-alphanumeric input, unissued state codes (e.g. `00`), a `0` entity code, a non-`Z` reserved position, and a bad check digit. It also normalizes input — lowercase and punctuation like `27-AAACR-5055K1Z7` are accepted.

### gst_lookup

```json
{ "name": "gst_lookup", "arguments": { "gstin": "29AAACI1195H1ZI" } }
```

Returns the taxpayer record from gstinapi.com: legal name, status, jurisdiction, FSSAI license number, and registered addresses.

### gst_bulk

```json
{ "name": "gst_bulk", "arguments": { "gstins": ["27AAACR5055K1Z7", "29AAACI1195H1ZI"] } }
```

Validates and resolves each GSTIN, returning per-GSTIN results.

## How the validator works

A GSTIN has the structure `SS AAAAA9999Z C`:

```
SS  State code (two digits, 01–38, plus 96/97/99)
AAAAA5 digits
9999  4 digits
Z     reserved position, always the letter "Z"
C     modulus-36 check digit
```

- **State code** — mapped to a state name using the authoritative GSTIN state-code table (the same table shipped in the `@dlminds/gstin-api` package). Codes `96`/`97`/`99` are non-geographic (foreign territory / UT / centre jurisdiction).
- **PAN** — characters 3–12 must be 5 letters, 4 digits, 1 letter.
- **Check digit** — computed with the official modulus-36 Luhn variant. See https://gstinapi.com/blog/gstin-checksum-algorithm.

## Development

```bash
npm test          # 15 unit tests for the validator
npm run verify    # format-check script (also runs the validator cases)
npm start         # run the MCP server on stdio
```

The tests cover format rules, the check-digit algorithm, lowercase/punctuation normalization, and the state-code map.

## Project layout

```
gst-mcp/
├── server.js            # MCP server: tool handlers + transport
├── lib/
│   └── gstin.js         # Offline validation + live lookup
├── scripts/
│   ├── test.mjs         # Unit tests (npm test)
│   ├── verify.mjs       # Format checks (npm run verify)
│   └── boot-check.mjs   # Boot probe (optional)
├── .env.example         # Env vars (copy to .env for live lookups)
└── package.json
```

## Data source & licensing

Live data is provided by [gstinapi.com](https://gstinapi.com) under its free tier. The offline validator uses the official GSTIN state-code table and checksum algorithm. This project is licensed MIT.
