import {data, Form, NavLink, useActionData, useNavigation} from 'react-router';

function resolveStoreDomain(rawDomain) {
  const value = String(rawDomain || '').trim();
  if (!value) return '';

  return value
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .trim();
}

/**
 * @param {Route.ActionArgs} args
 */
export async function action({request, context}) {
  const formData = await request.formData();
  const contactName = String(formData.get('contactName') || '').trim();
  const businessName = String(formData.get('businessName') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const website = String(formData.get('website') || '').trim();
  const locationCount = String(formData.get('locationCount') || '').trim();
  const monthlyVolume = String(formData.get('monthlyVolume') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!contactName) {
    return data({ok: false, error: 'Please enter your name.'}, {status: 400});
  }

  if (!businessName) {
    return data({ok: false, error: 'Please enter your business name.'}, {status: 400});
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data({ok: false, error: 'Please enter a valid email address.'}, {status: 400});
  }

  if (!monthlyVolume) {
    return data({ok: false, error: 'Please select estimated monthly volume.'}, {status: 400});
  }

  if (message.length < 10) {
    return data(
      {ok: false, error: 'Please include a bit more detail about your wholesale needs.'},
      {status: 400},
    );
  }

  const storeDomain = resolveStoreDomain(context.env.PUBLIC_STORE_DOMAIN);
  if (!storeDomain) {
    return data({ok: false, error: 'Store domain is not configured.'}, {status: 500});
  }

  const endpoint = `https://${storeDomain}/contact`;
  const body = new URLSearchParams({
    form_type: 'contact',
    utf8: '✓',
    'contact[name]': contactName,
    'contact[email]': email,
    'contact[body]': `Wholesale inquiry for dustin@aspencoffee.co\n\nContact Name: ${contactName}\nBusiness Name: ${businessName}\nEmail: ${email}\nPhone: ${phone || 'Not provided'}\nWebsite: ${website || 'Not provided'}\nNumber of Locations: ${locationCount || 'Not provided'}\nEstimated Monthly Volume: ${monthlyVolume}\n\nMessage:\n${message}`,
  });

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      return data(
        {ok: false, error: 'Unable to send your inquiry right now. Please try again.'},
        {status: 502},
      );
    }

    return data({ok: true});
  } catch (error) {
    console.error('Wholesale form submission failed', error);
    return data(
      {ok: false, error: 'Unable to send your inquiry right now. Please try again.'},
      {status: 500},
    );
  }
}

/** @type {Route.MetaFunction} */
export const meta = () => {
  return [{title: 'Wholesale | Aspen Coffee Co'}];
};

export default function Wholesale() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';

  return (
    <div className="bg-[linear-gradient(180deg,#fefcf8_0%,#f8f1e8_40%,#fffdfa_100%)] px-6 pb-36 pt-32 dark:bg-[linear-gradient(180deg,#13110f_0%,#171310_45%,#14110f_100%)] md:pt-40">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mt-24 font-serif text-5xl leading-[0.95] tracking-[0.01em] text-foreground md:text-6xl">
            Wholesale Inquiry
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Tell us about your cafe, business, or team. We will follow up with pricing,
            onboarding details, and recommended coffees.
          </p>
        </div>

        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-[#e4d7c8] bg-white/80 py-6 shadow-[0_16px_42px_rgba(78,56,36,0.06)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_16px_42px_rgba(0,0,0,0.22)] md:py-8">
          <Form
            method="post"
            className="w-full max-w-none space-y-5 px-2 md:px-4"
            style={{maxWidth: 'none'}}
          >
            <div>
              <label htmlFor="wholesale-contact-name" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Contact Name
              </label>
              <input
                id="wholesale-contact-name"
                name="contactName"
                type="text"
                required
                className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
              />
            </div>

            <div>
              <label htmlFor="wholesale-business-name" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Business Name
              </label>
              <input
                id="wholesale-business-name"
                name="businessName"
                type="text"
                required
                className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="wholesale-email" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Email
                </label>
                <input
                  id="wholesale-email"
                  name="email"
                  type="email"
                  required
                  className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
                />
              </div>

              <div>
                <label htmlFor="wholesale-phone" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Phone
                </label>
                <input
                  id="wholesale-phone"
                  name="phone"
                  type="tel"
                  className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="wholesale-website" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Website or Instagram
                </label>
                <input
                  id="wholesale-website"
                  name="website"
                  type="text"
                  placeholder="https://..."
                  className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
                />
              </div>

              <div>
                <label htmlFor="wholesale-location-count" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  Number of Locations
                </label>
                <input
                  id="wholesale-location-count"
                  name="locationCount"
                  type="text"
                  placeholder="1"
                  className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
                />
              </div>
            </div>

            <div>
              <label htmlFor="wholesale-monthly-volume" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Estimated Monthly Volume
              </label>
              <select
                id="wholesale-monthly-volume"
                name="monthlyVolume"
                required
                defaultValue=""
                className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
              >
                <option value="" disabled>Select volume range</option>
                <option value="Under 25 lbs">Under 25 lbs</option>
                <option value="25 - 75 lbs">25 - 75 lbs</option>
                <option value="75 - 150 lbs">75 - 150 lbs</option>
                <option value="150+ lbs">150+ lbs</option>
              </select>
            </div>

            <div>
              <label htmlFor="wholesale-message" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Tell Us About Your Program
              </label>
              <textarea
                id="wholesale-message"
                name="message"
                rows={6}
                required
                className="w-full rounded-lg border border-[#dfd1c2] bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 min-w-[220px] items-center justify-center rounded-lg bg-primary px-8 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Submit Wholesale Inquiry'}
            </button>
          </Form>

          {actionData?.ok ? (
            <p className="mx-2 mt-5 rounded-lg border border-emerald-300/40 bg-emerald-50/70 px-4 py-3 text-sm text-foreground dark:border-emerald-300/20 dark:bg-emerald-900/10 md:mx-4">
              Inquiry sent. We will follow up soon.
            </p>
          ) : null}

          {actionData?.ok === false ? (
            <p className="mx-2 mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive md:mx-4">
              {actionData.error}
            </p>
          ) : null}

          <p className="mx-2 mt-6 text-sm text-muted-foreground md:mx-4">
            Looking for customer support instead?{' '}
            <NavLink to="/contact" className="underline underline-offset-4 hover:text-foreground">
              Visit the contact page
            </NavLink>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/wholesale').Route} Route */
