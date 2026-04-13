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
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const subject = String(formData.get('subject') || '').trim();
  const message = String(formData.get('message') || '').trim();

  if (!name) {
    return data({ok: false, error: 'Please enter your name.'}, {status: 400});
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return data({ok: false, error: 'Please enter a valid email address.'}, {status: 400});
  }

  if (!subject) {
    return data({ok: false, error: 'Please select a subject.'}, {status: 400});
  }

  if (message.length < 10) {
    return data(
      {ok: false, error: 'Please include a bit more detail in your message.'},
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
    'contact[name]': name,
    'contact[email]': email,
    'contact[body]': `Contact form submission for dustin@aspencoffee.co\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
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
        {ok: false, error: 'Unable to send your message right now. Please try again.'},
        {status: 502},
      );
    }

    return data({ok: true});
  } catch (error) {
    console.error('Contact form submission failed', error);
    return data(
      {ok: false, error: 'Unable to send your message right now. Please try again.'},
      {status: 500},
    );
  }
}

/** @type {Route.MetaFunction} */
export const meta = () => {
  return [{title: 'Contact | Aspen Coffee Co'}];
};

export default function Contact() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';

  return (
    <div className="bg-[linear-gradient(180deg,#fefcf8_0%,#f8f1e8_40%,#fffdfa_100%)] px-6 pb-36 pt-32 dark:bg-[linear-gradient(180deg,#13110f_0%,#171310_45%,#14110f_100%)] md:pt-40">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="mt-24 font-serif text-5xl leading-[0.95] tracking-[0.01em] text-foreground md:text-6xl">
            Get In Touch
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Questions about orders, subscriptions, or brewing? Send a message and we will get back to you.
          </p>
        </div>

        <div className="mx-auto max-w-4xl rounded-[1.75rem] border border-[#e4d7c8] bg-white/80 py-6 shadow-[0_16px_42px_rgba(78,56,36,0.06)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_16px_42px_rgba(0,0,0,0.22)] md:py-8">
          <Form
            method="post"
            className="w-full max-w-none space-y-5 px-2 md:px-4"
            style={{maxWidth: 'none'}}
          >
            <div>
              <label htmlFor="contact-name" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
              />
            </div>

            <div>
              <label htmlFor="contact-subject" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Subject
              </label>
              <select
                id="contact-subject"
                name="subject"
                required
                defaultValue=""
                className="h-12 w-full rounded-lg border border-[#dfd1c2] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
              >
                <option value="" disabled>Select a subject</option>
                <option value="Order Support">Order Support</option>
                <option value="Subscription Support">Subscription Support</option>
                <option value="Brew Help">Brew Help</option>
                <option value="Product Question">Product Question</option>
                <option value="General Inquiry">General Inquiry</option>
              </select>
            </div>

            <div>
              <label htmlFor="contact-message" className="mb-2 block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                required
                className="w-full rounded-lg border border-[#dfd1c2] bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/45 dark:border-white/15 dark:bg-white/5"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 min-w-[190px] items-center justify-center rounded-lg bg-primary px-8 text-xs font-medium uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </Form>

          {actionData?.ok ? (
            <p className="mx-2 mt-5 rounded-lg border border-emerald-300/40 bg-emerald-50/70 px-4 py-3 text-sm text-foreground dark:border-emerald-300/20 dark:bg-emerald-900/10 md:mx-4">
              Message sent. We will get back to you soon.
            </p>
          ) : null}

          {actionData?.ok === false ? (
            <p className="mx-2 mt-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive md:mx-4">
              {actionData.error}
            </p>
          ) : null}

          <p className="mx-2 mt-6 text-sm text-muted-foreground md:mx-4">
            Looking for wholesale?{' '}
            <NavLink to="/wholesale" className="underline underline-offset-4 hover:text-foreground">
              Submit a wholesale inquiry
            </NavLink>
            .
          </p>

          <p className="mx-2 mt-2 text-sm text-muted-foreground md:mx-4">
            Prefer email? Reach us directly at{' '}
            <a href="mailto:dustin@aspencoffee.co" className="underline underline-offset-4 hover:text-foreground">
              dustin@aspencoffee.co
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/contact').Route} Route */
