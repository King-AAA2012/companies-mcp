async function probe(label, url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    console.log(`\n=== ${label} ===`);
    console.log('status', res.status);
    console.log(text.slice(0, 500));
  } catch (e) {
    console.log(`\n=== ${label} ===`);
    console.log('ERROR', e.message);
  }
}

const urls = [
  ['PPF calc', 'https://fincalculator.in/api/v1/ppf?principal=12000&years=20&rate=7&installment=1000'],
  ['HSN search', 'https://gst-hsn-sac-api.vercel.app/v1/hsn/search?q=0906'],
  ['HSN by code', 'https://gst-hsn-sac-api.vercel.app/v1/hsn/0906'],
  ['RBI rates', 'https://indiandataproject.org/open-data'],
];

for (const [label, url] of urls) {
  await probe(label, url);
}
