import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';

const HERO_VIDEO_SRC = '/images/hero-coffee.mp4';

export default function HeroSection() {
  return (
    <section className="on-ink overflow-hidden bg-ink p-0 text-paper-2">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 py-10 md:grid-cols-[1.6fr_1fr] md:gap-12 md:py-14">
        <motion.div
          initial={{opacity: 0, y: 30}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
        >
          <p className="eyebrow mb-4 text-glow">
            Rooted in people. Roasted with purpose.
          </p>
          <h1 className="m-0 text-[clamp(3.25rem,7vw,6rem)] leading-[0.9]">
            Coffee is
            <br />
            <span className="text-glow">human.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-paper-2/80">
            Behind every cup are real people, remarkable places, and stories worth sharing.
            We&apos;re here to celebrate all of it.
          </p>
          <div className="mt-7 flex flex-wrap gap-4">
            <NavLink to="/collections/coffee" className="btn-cta">
              Shop coffee
              <ArrowRight className="h-4 w-4" />
            </NavLink>
            <NavLink to="/about" className="btn-outline">
              Our story
            </NavLink>
          </div>
        </motion.div>

        <motion.div
          initial={{opacity: 0, y: 30}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
          className="relative order-first mx-auto w-full max-w-[11rem] sm:max-w-[14rem] md:order-none md:max-w-[19rem]"
        >
          {/* Double-line arch frame */}
          <div className="rounded-t-full border-2 border-paper-2/40 p-2">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border-2 border-paper-2">
              <video
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Coffee being brewed"
              >
                <source src={HERO_VIDEO_SRC} type="video/mp4" />
              </video>
            </div>
          </div>
          <span className="absolute -left-6 bottom-6 rotate-[-6deg] whitespace-nowrap border-2 border-ink bg-cta px-3 py-1.5 font-display text-xs uppercase text-cta-ink shadow-block">
            Roasted in Pittsburgh
          </span>
        </motion.div>
      </div>
    </section>
  );
}
