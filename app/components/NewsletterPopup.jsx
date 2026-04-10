import {useEffect, useState} from 'react';
import {ArrowRight, X} from 'lucide-react';
import {useFetcher, useLocation} from 'react-router';

const NEWSLETTER_POPUP_KEY = 'aspen-newsletter-popup-seen-v1';

export function NewsletterPopup() {
  const fetcher = useFetcher();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Avoid showing the modal on account and cart flows.
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
      window.setTimeout(() => setOpen(false), 1100);
    }
  }, [fetcher.data]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 px-6" role="dialog" aria-modal="true" aria-label="Join our mailing list">
      <div className="relative w-full max-w-xl rounded-[1.6rem] border border-[#e7ddd1] bg-[linear-gradient(180deg,#fffdfa_0%,#f9f4ec_100%)] p-8 shadow-[0_30px_80px_rgba(66,46,30,0.2)] dark:border-white/10 dark:bg-[linear-gradient(180deg,#171311_0%,#1f1915_100%)] dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/80 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close newsletter popup"
        >
          <X className="h-4 w-4" />
        </button>

        <p className="mb-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">Mailing List</p>
        <h2 className="font-serif text-4xl leading-[0.98] tracking-[0.01em] text-foreground">
          Elevate your morning.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground">
          Get 10% off your next order, plus first access to new roasts, brew guides, and subscriber-only drops.
        </p>

        {submitted ? (
          <p className="mt-8 text-sm font-medium uppercase tracking-[0.14em] text-foreground">
            You're in. Your 10% off is on the way.
          </p>
        ) : (
          <fetcher.Form method="post" action="/api/newsletter" className="mt-8 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              name="email"
              placeholder="you@email.com"
              required
              className="h-12 flex-1 rounded-md border border-[#dccfbe] bg-white px-4 text-sm text-foreground outline-none transition-colors focus:border-foreground dark:border-white/15 dark:bg-white/5 dark:text-foreground"
            />
            <button
              type="submit"
              disabled={fetcher.state !== 'idle'}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-xs uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {fetcher.state === 'idle' ? 'Join' : 'Joining...'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </fetcher.Form>
        )}
        {!submitted && fetcher.data?.ok === false ? (
          <p className="mt-3 text-xs text-destructive">{fetcher.data.error}</p>
        ) : null}
      </div>
    </div>
  );
}
