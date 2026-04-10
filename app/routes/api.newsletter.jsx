import {data} from 'react-router';

function resolveStoreDomain(rawDomain) {
  const value = String(rawDomain || '').trim();
  if (!value) return '';

  // Accept either "store.myshopify.com" or full URLs like "https://store.myshopify.com/".
  return value
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .trim();
}

async function subscribeViaCustomerCreate(context, email) {
  if (!context?.storefront?.mutate) {
    return {ok: false};
  }

  const randomPassword = `${crypto.randomUUID()}Aa1!`;

  const result = await context.storefront.mutate(CUSTOMER_CREATE_MUTATION, {
    variables: {
      input: {
        email,
        password: randomPassword,
        acceptsMarketing: true,
      },
    },
  });

  const errors = result?.customerCreate?.customerUserErrors || [];

  if (!errors.length) {
    return {ok: true};
  }

  // If the customer already exists, assume they are already in the system and avoid blocking signup UX.
  const isAlreadyRegistered = errors.some(
    (error) =>
      error?.code === 'TAKEN' ||
      /already|taken|exists/i.test(String(error?.message || '')),
  );

  if (isAlreadyRegistered) {
    return {ok: true};
  }

  return {ok: false, errors};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const formData = await request.formData();
  const email = String(formData.get('email') || '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data({ok: false, error: 'Please enter a valid email address.'}, {status: 400});
  }

  const storeDomain = resolveStoreDomain(context.env.PUBLIC_STORE_DOMAIN);
  if (!storeDomain) {
    return data({ok: false, error: 'Store domain is not configured.'}, {status: 500});
  }

  const endpoint = `https://${storeDomain}/contact`;
  const body = new URLSearchParams({
    form_type: 'customer',
    utf8: '✓',
    'contact[email]': email,
    'contact[tags]': 'newsletter,popup',
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (response.ok) {
      return data({ok: true});
    }

    // Shopify may return a bot challenge (403) for server-side POSTs to /contact.
    // Fallback to Storefront API customerCreate with marketing consent.
    const fallbackResult = await subscribeViaCustomerCreate(context, email);
    if (fallbackResult.ok) {
      return data({ok: true});
    }

    return data({ok: false, error: 'Unable to subscribe right now. Please try again.'}, {status: 502});
  } catch (error) {
    console.error('Newsletter subscribe failed via contact endpoint', error);

    try {
      const fallbackResult = await subscribeViaCustomerCreate(context, email);
      if (fallbackResult.ok) {
        return data({ok: true});
      }
    } catch (fallbackError) {
      console.error('Newsletter fallback customerCreate failed', fallbackError);
    }

    return data({ok: false, error: 'Unable to subscribe right now. Please try again.'}, {status: 500});
  }
}

const CUSTOMER_CREATE_MUTATION = `#graphql
  mutation CustomerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
`;

/** @typedef {import('./+types/api.newsletter').Route} Route */
