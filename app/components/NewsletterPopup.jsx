import {useEffect, useState} from 'react';
import {ArrowRight, X} from 'lucide-react';
import {useFetcher, useLocation} from 'react-router';
import {Logo} from '~/components/Header';

const NEWSLETTER_POPUP_KEY = 'aspen-newsletter-popup-seen-v1';

export function NewsletterPopup() {
  const fetcher = useFetcher();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Avoid showing the slide-in on account and cart flows.
    if (location.pathname.startsWith('/account') || location.pathname === '/cart') {
      return;
    }

    const alreadySeen = window.localStorage.getItem(NEWSLETTER_POPUP_KEY) === 'true';
    if (alreadySeen) return;

    const timeout = window.setTimeout(() => {
      setOpen(true);
      window.localStorage.setItem(NEWSLETTER_POPUP_KEY, 'true');
    }, 1200);

    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  function closeModal() {
    setOpen(false);
  }

  useEffect(() => {
    if (fetcher.data?.ok) {
      setSubmitted(true);
      window.setTimeout(() => setOpen(false), 2500);
    }
  }, [fetcher.data]);

  if (!open) return null;

  // Corner slide-in rather than a modal: it never blocks the page.
  return (
    <section
      aria-label="Join our mailing list"
      className="fixed inset-x-4 bottom-4 z-[70] animate-in fade-in slide-in-from-bottom-6 duration-500 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[22rem]"
    >
      <div className="relative border-2 border-ink bg-pop-1 p-5 text-ink shadow-block">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center border-2 border-ink bg-paper-2 transition-colors hover:bg-cta"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <Logo variant="mark" label="" className="mb-3 h-10" />

        {submitted ? (
          <p className="m-0 pr-8 font-display text-xl uppercase leading-tight">
            You&apos;re in. Your 10% off is on the way.
          </p>
        ) : (
          <>
            <p className="m-0 pr-8 font-display text-2xl uppercase leading-none">Get 10% off</p>
            <p className="mb-4 mt-2 text-sm">
              Join the list for first dibs on new roasts, brew guides and subscriber-only drops.
            </p>
            <fetcher.Form method="post" action="/api/newsletter" className="flex max-w-none border-2 border-ink">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden'}} />
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                aria-label="Email"
                required
                className="m-0 h-11 min-w-0 flex-1 border-0 bg-paper-2 px-3 text-sm text-ink placeholder:text-ink/50 focus:outline-none"
              />
              <button
                type="submit"
                disabled={fetcher.state !== 'idle'}
                className="inline-flex items-center gap-1.5 border-l-2 border-ink bg-ink px-4 font-display text-xs uppercase text-paper-2 transition-colors hover:bg-cta hover:text-cta-ink disabled:opacity-60"
              >
                {fetcher.state === 'idle' ? 'Join' : '…'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </fetcher.Form>
            {fetcher.data?.ok === false ? (
              <p className="mb-0 mt-3 text-sm font-semibold text-destructive">{fetcher.data.error}</p>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
