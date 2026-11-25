/**
 * Indian PIN code lookup.
 *
 * A PIN code (Postal Index Number) is the 6-digit postal code used by India
 * Post. The first two digits mark the state/region, the last three the office.
 *
 * Data source: https://api.dharun.dev (free, no API key, CORS allowed), which
 * itself draws on the Government Open Data of India "All India Pincode Directory"
 * (Department of Posts, published on data.gov.in under GODL).
 *
 * Endpoint: GET https://api.dharun.dev/v1/pincode/{pincode}
 * Returns:  { data: { pincode, district, stateCode, state, offices: [...] }, meta }
 *          or 404 { error: { code, message } } for an unknown pincode.
 */

const BASE_URL = 'https://api.dharun.dev/v1/pincode';

/**
 * Validate a PIN code locally: must be exactly 6 ASCII digits.
 * @param {unknown} pincode
 * @returns {{ valid: boolean, error?: string, pincode?: string }}
 */
function validatePincode(pincode) {
  if (typeof pincode !== 'string') {
    return { valid: false, error: 'pincode must be a string' };
  }
  const p = pincode.trim();
  if (!/^\d{6}$/.test(p)) {
    return { valid: false, error: 'pincode must be exactly 6 digits' };
  }
  return { valid: true, pincode: p };
}

/**
 * Fetch location details for a valid 6-digit Indian PIN code.
 * @param {string} pincode
 * @returns {Promise<object>} the resolved record, or an error object
 */
export async function fetchPincode(pincode) {
  const v = validatePincode(pincode);
  if (!v.valid) {
    throw new Error(v.error);
  }
  const url = `${BASE_URL}/${v.pincode}`;
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    const message =
      body?.error?.message || `HTTP ${res.status}: no post office found for pincode ${v.pincode}`;
    throw new Error(message);
  }
  const data = body.data ?? body;
  // The API returns { pincode, district, stateCode, state, offices } without a
  // country field; synthesize it since callers expect it.
  return {
    ...data,
    country: data.country ?? 'India',
  };
}

export { validatePincode };
