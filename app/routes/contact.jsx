import {data, Form, NavLink, useActionData, useNavigation} from 'react-router';
import {seoMeta} from '~/lib/meta';
import {PageHeader} from '~/components/PageHeader';
import {useEffect, useRef} from 'react';
import {sendEmail} from '~/lib/email.server';

/**
 * @param {Route.ActionArgs} args
 */
export async function action({request, context}) {
  const formData = await request.formData();

  // Honeypot — bots fill this, real users never see it
  if (formData.get('_hp')) return data({ok: true});

  // Timing check — bots submit instantly; require at least 3 seconds
  const renderedAt = Number(formData.get('_t') || 0);
  if (!renderedAt || Date.now() - renderedAt < 3000) return data({ok: true});

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

  const apiKey = context.env.POSTMARK_API_KEY;
  if (!apiKey) {
    return data({ok: false, error: 'Email service is not configured.'}, {status: 500});
  }

  const result = await sendEmail({
    apiKey,
    from: 'Aspen Coffee Co <hello@aspencoffee.co>',
    to: 'dustin@aspencoffee.co',
    replyTo: email,
    subject: `[${subject}] — ${name}`,
    text: [
      `From: ${name} <${email}>`,
      `Subject: ${subject}`,
      ``,
      `Message:`,
      message,
    ].join('\n'),
  });

  if (!result.ok) {
    console.error('Contact email failed:', result.error);
    return data(
      {ok: false, error: 'Unable to send your message right now. Please try again.'},
      {status: 502},
    );
  }

  return data({ok: true});
}

/** @type {Route.MetaFunction} */
export const meta = ({matches}) =>
  seoMeta({
    title: 'Contact',
    description: 'Questions about an order, a subscription or brewing? Get in touch with Aspen Coffee Co.',
    matches,
  });

export default function Contact() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state !== 'idle';
  const timestampRef = useRef(null);

  useEffect(() => {
    if (timestampRef.current) {
      timestampRef.current.value = Date.now().toString();
    }
  }, []);

  return (
    <div>
      <PageHeader eyebrow="Contact" title="Get in touch" tone="bg-pop-2">
        Questions about orders, subscriptions, or brewing? Send a message and we will get back to you.
      </PageHeader>
      <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">

        <div className="block-card mx-auto max-w-4xl p-6 shadow-block-lg md:p-10">
          <Form
            method="post"
            className="w-full max-w-none space-y-5"
            style={{maxWidth: 'none'}}
          >
            {/* Timing token — set on mount so instant bot submissions fail */}
            <input ref={timestampRef} type="hidden" name="_t" defaultValue="" />

            {/* Honeypot — visually hidden, bots fill it, real users don't */}
            <div aria-hidden="true" style={{position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none'}}>
              <label htmlFor="contact-website">Website</label>
              <input id="contact-website" name="_hp" type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div>
              <label htmlFor="contact-name" className="eyebrow mb-2 block">
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                className="field m-0 h-12"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="eyebrow mb-2 block">
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                className="field m-0 h-12"
              />
            </div>

            <div>
              <label htmlFor="contact-subject" className="eyebrow mb-2 block">
                Subject
              </label>
              <select
                id="contact-subject"
                name="subject"
                required
                defaultValue=""
                className="field m-0 h-12"
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
              <label htmlFor="contact-message" className="eyebrow mb-2 block">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={6}
                required
                className="field m-0"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cta min-w-[190px]"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </Form>

          {actionData?.ok ? (
            <p className="mt-6 border-2 border-ink bg-pop-1 px-4 py-3 text-sm font-semibold">
              Message sent. We will get back to you soon.
            </p>
          ) : null}

          {actionData?.ok === false ? (
            <p className="mt-6 border-2 border-destructive bg-paper-2 px-4 py-3 text-sm font-semibold text-destructive">
              {actionData.error}
            </p>
          ) : null}

          <p className="mt-8 text-sm">
            Looking for wholesale?{' '}
            <NavLink to="/wholesale" className="font-bold underline decoration-cta decoration-[3px] underline-offset-4">
              Submit a wholesale inquiry
            </NavLink>
            .
          </p>

          <p className="mt-2 text-sm">
            Prefer email? Reach us directly at{' '}
            <a href="mailto:dustin@aspencoffee.co" className="font-bold underline decoration-cta decoration-[3px] underline-offset-4">
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
