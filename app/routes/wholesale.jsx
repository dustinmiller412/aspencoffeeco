import {data, Form, NavLink, useActionData, useNavigation} from 'react-router';
import {PageHeader} from '~/components/PageHeader';
import {sendEmail} from '~/lib/email.server';

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

  const apiKey = context.env.POSTMARK_API_KEY;
  if (!apiKey) {
    return data({ok: false, error: 'Email service is not configured.'}, {status: 500});
  }

  const result = await sendEmail({
    apiKey,
    from: 'Aspen Coffee Co <hello@aspencoffee.co>',
    to: 'dustin@aspencoffee.co',
    replyTo: email,
    subject: `Wholesale Inquiry — ${businessName}`,
    text: [
      `Contact Name: ${contactName}`,
      `Business Name: ${businessName}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      `Website: ${website || 'Not provided'}`,
      `Number of Locations: ${locationCount || 'Not provided'}`,
      `Estimated Monthly Volume: ${monthlyVolume}`,
      ``,
      `Message:`,
      message,
    ].join('\n'),
  });

  if (!result.ok) {
    console.error('Wholesale email failed:', result.error);
    return data(
      {ok: false, error: 'Unable to send your inquiry right now. Please try again.'},
      {status: 502},
    );
  }

  return data({ok: true});
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
    <div>
      <PageHeader eyebrow="For cafes & teams" title="Wholesale inquiry" dark>
        Tell us about your cafe, business, or team. We will follow up with pricing,
            onboarding details, and recommended coffees.
      </PageHeader>
      <div className="mx-auto max-w-5xl px-6 py-14 md:py-20">

        <div className="block-card mx-auto max-w-4xl p-6 shadow-block-lg md:p-10">
          <Form
            method="post"
            className="w-full max-w-none space-y-5"
            style={{maxWidth: 'none'}}
          >
            <div>
              <label htmlFor="wholesale-contact-name" className="eyebrow mb-2 block">
                Contact Name
              </label>
              <input
                id="wholesale-contact-name"
                name="contactName"
                type="text"
                required
                className="field m-0 h-12"
              />
            </div>

            <div>
              <label htmlFor="wholesale-business-name" className="eyebrow mb-2 block">
                Business Name
              </label>
              <input
                id="wholesale-business-name"
                name="businessName"
                type="text"
                required
                className="field m-0 h-12"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="wholesale-email" className="eyebrow mb-2 block">
                  Email
                </label>
                <input
                  id="wholesale-email"
                  name="email"
                  type="email"
                  required
                  className="field m-0 h-12"
                />
              </div>

              <div>
                <label htmlFor="wholesale-phone" className="eyebrow mb-2 block">
                  Phone
                </label>
                <input
                  id="wholesale-phone"
                  name="phone"
                  type="tel"
                  className="field m-0 h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="wholesale-website" className="eyebrow mb-2 block">
                  Website or Instagram
                </label>
                <input
                  id="wholesale-website"
                  name="website"
                  type="text"
                  placeholder="https://..."
                  className="field m-0 h-12"
                />
              </div>

              <div>
                <label htmlFor="wholesale-location-count" className="eyebrow mb-2 block">
                  Number of Locations
                </label>
                <input
                  id="wholesale-location-count"
                  name="locationCount"
                  type="text"
                  placeholder="1"
                  className="field m-0 h-12"
                />
              </div>
            </div>

            <div>
              <label htmlFor="wholesale-monthly-volume" className="eyebrow mb-2 block">
                Estimated Monthly Volume
              </label>
              <select
                id="wholesale-monthly-volume"
                name="monthlyVolume"
                required
                defaultValue=""
                className="field m-0 h-12"
              >
                <option value="" disabled>Select volume range</option>
                <option value="5 - 25 lbs">5 - 25 lbs</option>
                <option value="25 - 75 lbs">25 - 75 lbs</option>
                <option value="75 - 150 lbs">75 - 150 lbs</option>
                <option value="150+ lbs">150+ lbs</option>
              </select>
            </div>

            <div>
              <label htmlFor="wholesale-message" className="eyebrow mb-2 block">
                Tell Us About Your Program
              </label>
              <textarea
                id="wholesale-message"
                name="message"
                rows={6}
                required
                className="field m-0"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cta min-w-[220px]"
            >
              {isSubmitting ? 'Sending...' : 'Submit Wholesale Inquiry'}
            </button>
          </Form>

          {actionData?.ok ? (
            <p className="mt-6 border-2 border-ink bg-pop-1 px-4 py-3 text-sm font-semibold">
              Inquiry sent. We will follow up soon.
            </p>
          ) : null}

          {actionData?.ok === false ? (
            <p className="mt-6 border-2 border-destructive bg-paper-2 px-4 py-3 text-sm font-semibold text-destructive">
              {actionData.error}
            </p>
          ) : null}

          <p className="mt-8 text-sm">
            Looking for customer support instead?{' '}
            <NavLink to="/contact" className="font-bold underline decoration-cta decoration-[3px] underline-offset-4">
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
