# Known gaps & debt

Notes on things left intentionally undone or known to be imperfect. Keep this
file current as you change code.

## Live lookups need a key

`gst_lookup` and `gst_bulk` require a `GSTINAPI_KEY` (see
[gstinapi.com](https://gstinapi.com)). Without it they return a "key not set"
error. `validate_gstin` works offline.

## Transport

Only the stdio transport is implemented. The `MCP_TRANSPORT=http` and
`MCP_PORT` env vars in `.env.example` are documented but not wired up yet.

## Rate limits

Live data is on gstinapi.com's free tier (75 lookups/day). `gst_bulk` sends one
request per GSTIN, so a large batch can hit the daily cap. Consider caching
results in a future version.

## Data freshness

`gst_lookup` reflects gstinapi.com's snapshot at request time; the API does not
guarantee real-time freshness. Do not treat legal-name/status as authoritative
for compliance without a cross-check.
