/**
 * Send a transactional email via Postmark.
 * Requires POSTMARK_API_KEY in env.
 * The `from` address must be on a domain verified in Postmark.
 *
 * @param {{apiKey: string, from: string, to: string, replyTo?: string, subject: string, text: string}} opts
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function sendEmail({apiKey, from, to, replyTo, subject, text}) {
  const res = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': apiKey,
    },
    body: JSON.stringify({
      From: from,
      To: to,
      ...(replyTo ? {ReplyTo: replyTo} : {}),
      Subject: subject,
      TextBody: text,
    }),
  });

  if (res.ok) return {ok: true};

  const body = await res.json().catch(() => ({}));
  return {ok: false, error: body?.Message ?? `Postmark error ${res.status}`};
}
