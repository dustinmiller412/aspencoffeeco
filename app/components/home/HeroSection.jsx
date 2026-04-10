import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';

const HERO_VIDEO_SRC = '/images/hero-coffee.mp4';
const HERO_POSTER_SRC = '/images/hero-coffee.png';

export default function HeroSection() {
  return (
    <section className="relative flex h-screen items-start pt-44 md:pt-56 overflow-hidden">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={HERO_POSTER_SRC}
          aria-label="Premium coffee"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
          <img
            src={HERO_POSTER_SRC}
            alt="Premium coffee"
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0.22)_48%,rgba(255,255,255,0.30)_100%)] dark:bg-[linear-gradient(180deg,rgba(10,10,10,0.24)_0%,rgba(10,10,10,0.18)_48%,rgba(10,10,10,0.28)_100%)]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{opacity: 0, y: 40}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 1, ease: [0.22, 1, 0.36, 1]}}
          className="max-w-3xl"
        >
          <motion.p
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.3, duration: 0.8}}
            className="text-xs tracking-[0.24em] uppercase text-white mb-6"
          >
            Your next favorite cup starts here.
          </motion.p>

          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.88] tracking-[0.01em] text-foreground mb-8">
            From farm to cup, {' '}
            <span className="italic text-accent dark:text-stone-400">every coffee has a story.</span>
          </h1>

          <motion.p
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.6, duration: 0.8}}
            className="text-white text-[1.05rem] md:text-[1.2rem] leading-[1.55] mb-10 max-w-xl"
          >
            We're here to connect you to all of it. 
          </motion.p>

          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.9, duration: 0.8}}
            className="flex flex-col sm:flex-row gap-4"
          >
            <NavLink
              to="/collections/coffee"
              className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 text-sm font-medium tracking-[0.16em] uppercase transition-colors duration-500 hover:bg-primary/85 hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background select-none"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </NavLink>
            <NavLink
              to="/"
              className="inline-flex items-center justify-center gap-3 border border-foreground/15 bg-white/60 px-8 py-4 text-sm font-medium tracking-[0.16em] uppercase text-foreground transition-colors duration-500 hover:bg-white/85 dark:border-white/15 dark:bg-black/30 dark:hover:bg-black/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background select-none"
            >
              Our Story
            </NavLink>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
