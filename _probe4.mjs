async function probe(label, url) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const text = await res.text();
    console.log(`\n=== ${label} ===`);
    console.log('status', res.status);
    console.log(text.slice(0, 300));
  } catch (e) {
    console.log(`\n=== ${label} ===`);
    console.log('ERROR', e.message);
  }
}

// PPF calc - try the API path and a couple alternatives
const urls = [
  ['PPF calc api', 'https://fincalculator.in/api/v1/ppf?principal=12000&years=20&rate=7&installment=1000'],
  ['PPF calc v2', 'https://fincalculator.in/api/ppf?principal=12000&years=20&rate=7&installment=1000'],
  ['PPF calc /ppf', 'https://fincalculator.in/ppf'],
  ['IFSC razorpay', 'https://ifsc.razorpay.com/PSBB0000001'],
  ['IFSC rbi', 'https://ifsc.rbi.org.in/INR0000001'],
];

for (const [label, url] of urls) {
  await probe(label, url);
}
