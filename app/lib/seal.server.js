const BASE_URL = 'https://app.sealsubscriptions.com/shopify/merchant/api';

/**
 * Verify a Seal webhook signature.
 * Algorithm: base64(HMAC-SHA256(rawBody, secret))
 * Header:    X-Seal-Hmac-Sha256
 * Topic:     X-Seal-Topic
 *
 * @param {string} secret   SEAL_API_SECRET from env
 * @param {string} rawBody  request.text() — must be read before any JSON.parse
 * @param {string} signature value of the X-Seal-Hmac-Sha256 request header
 * @returns {Promise<boolean>}
 */
export async function verifySealWebhook(secret, rawBody, signature) {
  if (!secret || !rawBody || !signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    {name: 'HMAC', hash: 'SHA-256'},
    false,
    ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody));

  // Convert to base64 — matches PHP's base64_encode(hash_hmac('sha256', $data, $secret, true))
  let binary = '';
  for (const b of new Uint8Array(mac)) binary += String.fromCharCode(b);
  const computed = btoa(binary);

  // Constant-time comparison to prevent timing attacks
  if (computed.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Creates a Seal Subscriptions Merchant API client.
 * Token comes from Settings → General Settings → API inside the Seal app.
 *
 * Rate limit: 10 concurrent requests. Throws on 503 so callers can retry.
 */
export function sealClient(token) {
  async function request(method, path, body) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Seal-Token': token,
      },
      ...(body !== undefined ? {body: JSON.stringify(body)} : {}),
    });

    if (res.status === 503) {
      throw new Error('Seal API rate limit exceeded — retry shortly');
    }
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Seal API ${res.status}: ${text}`);
    }

    return res.json();
  }

  return {
    /**
     * List subscriptions for a customer by email.
     * Pass opts like `{'active-only': 'true'}` to narrow results.
     */
    getSubscriptionsByEmail(email, opts = {}) {
      const params = new URLSearchParams({
        query: email,
        'with-items': 'true',
        'with-billing-attempts': 'true',
        ...opts,
      });
      return request('GET', `/subscriptions?${params}`);
    },

    getSubscription(id) {
      return request('GET', `/subscription?id=${id}`);
    },

    pauseSubscription(id) {
      return request('PUT', '/subscription', {id, action: 'pause'});
    },

    resumeSubscription(id) {
      return request('PUT', '/subscription', {id, action: 'resume'});
    },

    cancelSubscription(id) {
      return request('PUT', '/subscription', {id, action: 'cancel'});
    },

    skipBillingAttempt(billingAttemptId, subscriptionId) {
      return request('PUT', '/subscription-billing-attempt', {
        id: billingAttemptId,
        subscription_id: subscriptionId,
        action: 'skip',
      });
    },

    unskipBillingAttempt(billingAttemptId, subscriptionId) {
      return request('PUT', '/subscription-billing-attempt', {
        id: billingAttemptId,
        subscription_id: subscriptionId,
        action: 'unskip',
      });
    },

    /**
     * Returns a magic link URL the customer can use to update their
     * payment method on Seal's hosted page.
     */
    getMagicLink(email) {
      return request('GET', `/customer-magic-link?email=${encodeURIComponent(email)}`);
    },

    createWebhook(topic, address) {
      return request('POST', '/webhooks', {topic, address});
    },

    listWebhooks() {
      return request('GET', '/webhooks');
    },

    deleteWebhook(id) {
      return request('DELETE', `/webhooks?id=${id}`);
    },
  };
}
