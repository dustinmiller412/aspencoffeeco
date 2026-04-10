import {motion} from 'framer-motion';
import {NavLink} from 'react-router';

export default function TestimonialBanner() {
  return (
    <section className="border-y border-[#e6ddd2] bg-[#efefef] py-20 dark:border-white/10 dark:bg-[#1a1715] md:py-24">
      <motion.div
        initial={{opacity: 0, y: 18}}
        whileInView={{opacity: 1, y: 0}}
        viewport={{once: true}}
        transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}
        className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2 md:gap-12"
      >
        <div className="aspect-[4/3] w-full overflow-hidden bg-[#c7b09d]">
          <img
            src="/images/hero-coffee.png"
            alt="Coffee subscription"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/70">
            Fresh Coffee. On your schedule.
          </p>
          <h3 className="max-w-[18ch] font-sans text-4xl leading-[1.08] tracking-[-0.01em] text-foreground md:text-5xl">
            Let us do the hard work for you.
          </h3>
          <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-foreground/75 md:text-base">
            Subscribe for free shipping, first access to new drops, and a
            reliable coffee routine without the guesswork.  
          </p>

          <NavLink
            to="/collections/subscriptions"
            className="mt-7 inline-flex h-11 items-center justify-center bg-[#1f2a47] px-7 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-300 hover:bg-[#17203a]"
          >
            Subscribe To Coffee
          </NavLink>
        </div>
      </motion.div>
    </section>
  );
}
