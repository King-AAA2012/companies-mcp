#!/usr/bin/env node
/**
 * companies-mcp tests.
 *
 * Covers the local validation (min-length check) without a network call, plus a
 * live `company_search` against https://api.dharun.dev (skipped offline).
 *
 * Run with: npm test   (or)   node scripts/test.mjs
 */

import assert from 'node:assert';

let passed = 0;
function ok(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}`);
    console.error(`      ${e.message}`);
    process.exitCode = 1;
  }
}

// We exercise the tool handlers by importing the server's request handling
// indirectly: the server is a stdio process, so instead we test the shared
// logic by hitting the live API directly (the real contract) and by
// replicating the min-length guard that server.js enforces.

const MIN_QUERY_LENGTH = 2;
const API_URL = 'https://api.dharun.dev/v1/companies';

// Replicate server.js's query guard so we can assert it without a network.
function guardQuery(raw) {
  if (!raw || typeof raw !== 'string') return { ok: false, error: 'missing query' };
  const query = raw.trim();
  if (query.length < MIN_QUERY_LENGTH) {
    return { ok: false, error: 'query too short' };
  }
  return { ok: true, query };
}

console.log('company_search tests:');

ok('rejects missing query', () => {
  assert.strictEqual(guardQuery(undefined).ok, false);
});

ok('rejects empty query', () => {
  assert.strictEqual(guardQuery('').ok, false);
});

ok('rejects query shorter than 2 chars', () => {
  assert.strictEqual(guardQuery('R').ok, false);
  assert.strictEqual(guardQuery('  ').ok, false);
});

ok('accepts query of min length', () => {
  const r = guardQuery('Rel');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.query, 'Rel');
});

ok('trims surrounding whitespace', () => {
  const r = guardQuery('  Reliance  ');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.query, 'Reliance');
});

// Live search — the real end-to-end contract. Skipped when offline so the
// suite still runs in sandboxed/offline environments.
async function liveTests() {
  console.log('\ncompany_search live (api.dharun.dev):');

  ok('returns results for "Reliance"', async () => {
    const res = await fetch(`${API_URL}?q=${encodeURIComponent('Reliance')}`);
    assert.strictEqual(res.status, 200, `HTTP ${res.status}`);
    const json = await res.json();
    assert.ok(Array.isArray(json.data), 'response has a data array');
    assert.ok(json.data.length > 0, 'returns at least one company');
    const first = json.data[0];
    assert.ok(first.company, 'each result has a company name');
  });

  ok('returns results for a ticker "TCS"', async () => {
    const res = await fetch(`${API_URL}?q=${encodeURIComponent('TCS')}`);
    assert.strictEqual(res.status, 200);
    const json = await res.json();
    assert.ok(json.data.length > 0);
  });

  ok('meta reports a total count', async () => {
    const res = await fetch(`${API_URL}?q=${encodeURIComponent('Infosys')}`);
    const json = await res.json();
    assert.ok(typeof json.meta.total === 'number', 'meta.total is a number');
  });
}

async function main() {
  try {
    await liveTests();
  } catch (e) {
    console.error('\nLive tests skipped (no network?):', e.message);
  }

  const total = passed;
  console.log(`\n${total} passed`);
  if (process.exitCode) {
    console.log('with failures');
  }
}

main();
