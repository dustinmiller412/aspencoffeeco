/**
 * Register Seal Subscriptions webhooks via the Merchant API.
 *
 * Run once (or re-run safely — it checks for duplicates first):
 *
 *   node --env-file=.env scripts/setup-seal-webhooks.js
 *
 * Requires SEAL_API_TOKEN and STORE_DOMAIN in .env.
 * STORE_DOMAIN should be your public domain, e.g. aspencoffee.co
 */

const BASE_URL = 'https://app.sealsubscriptions.com/shopify/merchant/api';

const token = process.env.SEAL_API_TOKEN;
const domain = process.env.STORE_DOMAIN;

if (!token) {
  console.error('❌  SEAL_API_TOKEN is not set in .env');
  process.exit(1);
}
if (!domain) {
  console.error('❌  Add STORE_DOMAIN=aspencoffee.co to .env (your public storefront domain, not the myshopify.com URL)');
  process.exit(1);
}

const webhookBase = `https://${domain.replace(/^https?:\/\//, '')}`;

const WEBHOOK_ADDRESS = `${webhookBase}/api/seal-webhooks`;

const TOPICS = [
  'subscription/created',
  'subscription/updated',
  'subscription/paused',
  'subscription/resumed',
  'subscription/reactivated',
  'subscription/expired',
  'subscription/cancelled',
  'subscription/payment_method_updated',
  'subscription/shipping_address_updated',
  'billing_attempt/succeeded',
  'billing_attempt/failed',
  'billing_attempt/upcoming_email_sent',
];

async function sealRequest(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {'Content-Type': 'application/json', 'X-Seal-Token': token},
    ...(body !== undefined ? {body: JSON.stringify(body)} : {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Seal API ${res.status}: ${text}`);
  }
  return res.json();
}

async function main() {
  console.log(`\nSeal webhook setup → ${WEBHOOK_ADDRESS}\n`);

  // Fetch existing webhooks so we don't create duplicates
  const existing = await sealRequest('GET', '/webhooks');
  const registered = new Map(
    (existing.webhooks ?? []).map((w) => [`${w.topic}::${w.address}`, w]),
  );

  console.log(`Found ${registered.size} existing webhook(s).\n`);

  let created = 0;
  let skipped = 0;

  for (const topic of TOPICS) {
    const key = `${topic}::${WEBHOOK_ADDRESS}`;
    if (registered.has(key)) {
      console.log(`  ⏭  ${topic} (already registered)`);
      skipped++;
      continue;
    }

    try {
      await sealRequest('POST', '/webhooks', {topic, address: WEBHOOK_ADDRESS});
      console.log(`  ✅  ${topic}`);
      created++;
    } catch (err) {
      console.error(`  ❌  ${topic} — ${err.message}`);
    }
  }

  console.log(`\nDone. Created ${created}, skipped ${skipped} duplicate(s).\n`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
