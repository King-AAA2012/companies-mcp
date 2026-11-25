async function probe(label, url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    console.log(`\n=== ${label} ===`);
    console.log('status', res.status, res.headers.get('content-type'));
    console.log(text.slice(0, 700));
  } catch (e) {
    console.log(`\n=== ${label} ===`);
    console.log('ERROR', e.message);
  }
}

const urls = [
  ['RBI repo rate 12mo', 'https://indiandataproject.org/open-data/rbi/repo-rate/12month'],
  ['RBI repo rate current', 'https://indiandataproject.org/open-data/rbi/repo-rate/current'],
  ['RBI repo rate 30month', 'https://indiandataproject.org/open-data/rbi/repo-rate/30month'],
  ['RBI repo rate', 'https://indiandataproject.org/open-data/rbi/repo-rate'],
  ['RBI repo rate 6month', 'https://indiandataproject.org/open-data/rbi/repo-rate/6month'],
];

for (const [label, url] of urls) {
  await probe(label, url);
}
