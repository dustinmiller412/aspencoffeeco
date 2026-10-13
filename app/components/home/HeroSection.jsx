import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';

const HERO_VIDEO_SRC = '/images/hero-coffee.mp4';

export default function HeroSection() {
  return (
    <section className="on-ink overflow-hidden bg-ink p-0 text-paper-2">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
        <motion.div
          initial={{opacity: 0, y: 30}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
        >
          <p className="eyebrow mb-6 text-glow">Your next favorite cup starts here</p>
          <h1 className="m-0 text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.92]">
            From farm to cup, <span className="text-glow">every coffee has a story.</span>
          </h1>
          <p className="mt-8 max-w-lg text-lg text-paper-2/80">
            We&apos;re here to connect you to all of it.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
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
          className="relative order-first mx-auto w-full max-w-[17rem] sm:max-w-sm md:order-none md:max-w-md"
        >
          <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-full bg-pop-2" />
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
          <span className="absolute -left-4 bottom-10 rotate-[-6deg] border-2 border-ink bg-cta px-4 py-2 font-display text-sm uppercase text-cta-ink shadow-block">
            Roasted in Pittsburgh
          </span>
        </motion.div>
      </div>
    </section>
  );
}
