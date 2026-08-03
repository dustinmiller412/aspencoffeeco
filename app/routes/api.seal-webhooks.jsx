import {data} from 'react-router';
import {verifySealWebhook} from '~/lib/seal.server';

/**
 * Seal Subscriptions webhook receiver.
 *
 * Register this endpoint in Seal: Settings → Webhooks → https://yourdomain.com/api/seal-webhooks
 *
 * Seal sends:
 *   Header X-Seal-Hmac-Sha256  — base64(HMAC-SHA256(body, SEAL_API_SECRET))
 *   Header X-Seal-Topic        — e.g. "subscription/created"
 *   Body                       — JSON subscription payload
 *
 * Topics:
 *   subscription/created | updated | paused | resumed | reactivated |
 *   expired | payment_method_updated | shipping_address_updated | cancelled
 *   subscription_rule/created | updated
 *   billing_attempt/succeeded | failed | upcoming_email_sent
 */

/** @param {Route.ActionArgs} */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const signature = request.headers.get('X-Seal-Hmac-Sha256') ?? '';
  const topic = request.headers.get('X-Seal-Topic') ?? '';

  // Read raw body before parsing — signature covers the raw bytes
  const rawBody = await request.text();

  const isValid = await verifySealWebhook(
    context.env.SEAL_API_SECRET,
    rawBody,
    signature,
  );

  if (!isValid) {
    return data({error: 'Invalid HMAC signature'}, {status: 401});
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return data({error: 'Invalid JSON'}, {status: 400});
  }

  await handleWebhookTopic(topic, payload, context);

  // Seal requires HTTP 200 within 5 seconds; anything else triggers a retry
  return data({ok: true}, {status: 200});
}

/**
 * @param {string} topic
 * @param {object} payload
 * @param {object} context
 */
async function handleWebhookTopic(topic, payload, context) {
  switch (topic) {
    case 'subscription/created':
      // TODO: provision access, send welcome email, tag customer, etc.
      break;

    case 'subscription/cancelled':
    case 'subscription/expired':
      // TODO: revoke access, send win-back email, etc.
      break;

    case 'subscription/paused':
      // TODO: notify internal team or update a CRM record
      break;

    case 'subscription/resumed':
    case 'subscription/reactivated':
      // TODO: re-provision access, etc.
      break;

    case 'subscription/payment_method_updated':
      // TODO: log or notify
      break;

    case 'subscription/shipping_address_updated':
      // TODO: sync to external fulfillment system if needed
      break;

    case 'billing_attempt/succeeded':
      // TODO: track revenue, update loyalty points, etc.
      break;

    case 'billing_attempt/failed':
      // TODO: send dunning email, alert support team, etc.
      break;

    case 'billing_attempt/upcoming_email_sent':
      // No action needed in most cases
      break;

    default:
      // Unknown topic — log and ignore so Seal gets its 200
      console.warn(`Unhandled Seal webhook topic: ${topic}`, payload?.id);
  }
}

/** @typedef {import('./+types/api.seal-webhooks').Route} Route */
