import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {ArrowRight} from 'lucide-react';
import {useFetcher} from 'react-router';

export default function NewsletterSection() {
  const fetcher = useFetcher();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (fetcher.data?.ok) {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    }
  }, [fetcher.data]);

  return (
    <section id="subscribe" className="px-6 pt-24 pb-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{opacity: 0, y: 30}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.8}}
          className="max-w-2xl mx-auto rounded-[2rem] border border-[#e7ddd1] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,246,241,0.92))] px-8 py-14 text-center shadow-[0_20px_50px_rgba(92,66,43,0.045)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] dark:shadow-[0_20px_50px_rgba(0,0,0,0.24)]"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
            ROASTED FRESH. DELIVERED FIRST.
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-medium leading-[0.98] tracking-[0.01em] mb-6">
            Elevate your morning.
          </h2>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Join our mailing list and get 10% off your next order. First access to new roasts, brew guides, and member-only drops.
          </p>

          {submitted ? (
            <motion.p
              initial={{opacity: 0, scale: 0.95}}
              animate={{opacity: 1, scale: 1}}
              className="text-foreground font-medium"
            >
              You're in. Your 10% off is on the way.
            </motion.p>
          ) : (
            <fetcher.Form method="post" action="/api/newsletter" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                className="h-12 flex-1 px-4 border border-[#e2d7ca] bg-white text-sm rounded-lg focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent dark:border-white/10 dark:bg-white/5 dark:text-foreground transition-colors"
                required
              />
              <button
                type="submit"
                disabled={fetcher.state !== 'idle'}
                className="group inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 h-12 text-sm tracking-widest uppercase hover:bg-accent transition-colors duration-500 rounded-lg"
              >
                {fetcher.state === 'idle' ? 'Join' : 'Joining...'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </fetcher.Form>
          )}

          {!submitted && fetcher.data?.ok === false ? (
            <p className="mt-4 text-xs text-destructive">{fetcher.data.error}</p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
