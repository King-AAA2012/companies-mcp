async function probe(label, url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    console.log(`\n=== ${label} ===`);
    console.log('status', res.status);
    console.log(text.slice(0, 400));
  } catch (e) {
    console.log(`\n=== ${label} ===`);
    console.log('ERROR', e.message);
  }
}

const urls = [
  ['RBI summary', 'https://indiandataproject.org/data/rbi/2025-26/summary.json'],
  ['RBI monetary-policy', 'https://indiandataproject.org/data/rbi/2025-26/monetary-policy.json'],
  ['RBI indicators', 'https://indiandataproject.org/data/rbi/2025-26/indicators.json'],
];

for (const [label, url] of urls) {
  await probe(label, url);
}
