import assert from 'node:assert';
import { validatePincode, fetchPincode } from '../lib/pincode.js';

let passed = 0;
function ok(name, fn) {
  fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

async function okAsync(name, fn) {
  await fn();
  passed++;
  console.log(`  ✓ ${name}`);
}

console.log('PIN code validation tests:');

ok('accepts 6 digits', () => {
  assert.deepStrictEqual(validatePincode('560001'), { valid: true, pincode: '560001' });
});

ok('accepts surrounding whitespace', () => {
  assert.deepStrictEqual(validatePincode('  110001  '), { valid: true, pincode: '110001' });
});

ok('rejects non-numeric', () => {
  assert.strictEqual(validatePincode('56000a').valid, false);
});

ok('rejects too short', () => {
  assert.strictEqual(validatePincode('56000').valid, false);
});

ok('rejects too long', () => {
  assert.strictEqual(validatePincode('5600010').valid, false);
});

ok('rejects non-string', () => {
  assert.strictEqual(validatePincode(560001).valid, false);
});

console.log('PIN code lookup tests:');

okAsync('valid PIN returns location data', async () => {
  const data = await fetchPincode('560001');
  assert.ok(data, 'expected a record');
  assert.strictEqual(data.pincode, '560001');
  assert.strictEqual(data.state, 'Karnataka');
  assert.ok(data.district, 'expected a district');
  assert.ok(Array.isArray(data.offices), 'expected an offices array');
  assert.ok(data.offices.length > 0, 'expected at least one office');
  assert.strictEqual(data.country, 'India');
});

okAsync('invalid PIN (non-6-digit) is rejected', async () => {
  await assert.rejects(() => fetchPincode('12345'), { message: /6 digits/ });
});

okAsync('pincode starting with 0 is rejected by the API', async () => {
  await assert.rejects(() => fetchPincode('000000'), { message: /does not start with 0/ });
});

console.log(`\n${passed} passed.`);
