import {useEffect, useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {useFetcher} from 'react-router';
import {ContourDivider} from '~/components/ContourDivider';

export default function NewsletterSection() {
  const fetcher = useFetcher();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (fetcher.data?.ok) {
      setSubmitted(true);
    }
  }, [fetcher.data]);

  return (
    <section id="subscribe" className="mt-24 p-0">
      <ContourDivider fillBelow="fill-cta" />
      <div className="bg-cta px-6 py-16 text-cta-ink md:py-20">
        <div className="mx-auto grid max-w-7xl items-end gap-10 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow mb-4">Roasted fresh. Delivered first.</p>
            <h2 className="text-5xl md:text-7xl">New roasts, first dibs</h2>
            <p className="mt-5 max-w-lg text-lg">
              Join the list and get 10% off your next order, plus first access to new roasts,
              brew guides and member-only drops.
            </p>
          </div>

          <div>
            {submitted ? (
              <p className="block-card px-6 py-5 font-display text-xl uppercase">
                You&apos;re in. Your 10% off is on the way.
              </p>
            ) : (
              <fetcher.Form
                method="post"
                action="/api/newsletter"
                className="flex max-w-none border-2 border-ink shadow-block"
              >
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden'}}
                />
                <label htmlFor="newsletter-email" className="sr-only">
                  Email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  className="m-0 h-14 min-w-0 flex-1 border-0 bg-paper-2 px-4 text-ink placeholder:text-ink/50 focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={fetcher.state !== 'idle'}
                  className="inline-flex items-center gap-2 border-l-2 border-ink bg-ink px-6 font-display text-sm uppercase text-paper-2 transition-colors hover:bg-pop-1 hover:text-ink disabled:opacity-60"
                >
                  {fetcher.state === 'idle' ? 'Join' : 'Joining…'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </fetcher.Form>
            )}

            {!submitted && fetcher.data?.ok === false ? (
              <p className="mt-4 text-sm font-semibold">{fetcher.data.error}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
