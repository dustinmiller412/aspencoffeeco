import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight, Leaf, Flame, Handshake, Mountain} from 'lucide-react';

/** @type {Route.MetaFunction} */
export const meta = () => {
  return [{title: 'About | Aspen Coffee Co'}];
};

const JOURNEY_STEPS = [
  {
    number: '01',
    label: 'Farm',
    description:
      'Farmers select and harvest ripe cherries, often by hand. Altitude, soil, and care at this stage shape everything that follows.',
  },
  {
    number: '02',
    label: 'Process',
    description:
      'The cherry is washed, naturally dried, or fermented. These decisions — made by the producer — define the flavor from the ground up.',
  },
  {
    number: '03',
    label: 'Roast',
    description:
      'We roast in small batches in Pittsburgh, dialing in each origin to reveal its character rather than impose our own.',
  },
  {
    number: '04',
    label: 'Your Cup',
    description:
      'You choose the method. With each bag we share the story behind what you\'re brewing so the cup feels complete.',
  },
];

const VALUES = [
  {
    title: 'Origin First',
    text: 'We source with curiosity and respect. Every coffee starts with the people and places that shaped it long before it reaches us.',
    icon: Mountain,
  },
  {
    title: 'Roast With Intention',
    text: 'We roast in small batches and adjust constantly. The goal is not to impose a profile — it is to reveal what is already there.',
    icon: Flame,
  },
  {
    title: 'Relationships Over Trends',
    text: 'We are building a long-term coffee practice, not chasing novelty. Producers, customers, and quality all matter more than hype.',
    icon: Handshake,
  },
];

export default function About() {
  return (
    <div className="bg-[linear-gradient(180deg,#fefcf8_0%,#f7efe5_36%,#f6eee4_64%,#fffdfa_100%)] dark:bg-[linear-gradient(180deg,#13110f_0%,#181411_42%,#16120f_100%)]">

      {/* Hero */}
      <section className="px-6 pt-36 pb-24 text-center md:pt-48 md:pb-28">
        <motion.div
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
          className="mx-auto max-w-4xl"
        >
          <p className="mb-5 text-xs uppercase tracking-[0.24em] text-muted-foreground">About Aspen</p>
          <h1 className="font-serif text-5xl leading-[0.95] tracking-[0.01em] text-foreground md:text-6xl lg:text-7xl">
            From farm to cup,<br className="hidden sm:block" /> every coffee has a story.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            We&apos;re here to connect you to all of it. Aspen exists to make specialty coffee more
            accessible — and to help you understand the producers, decisions, and craft behind every
            cup you drink.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <NavLink
              to="/collections/coffee"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Shop Coffee
              <ArrowRight className="h-4 w-4" />
            </NavLink>
            <NavLink
              to="/fieldnotes"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 px-6 py-3 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-background/70"
            >
              Read Field Notes
            </NavLink>
          </div>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="px-6 pb-28">
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
          className="mx-auto max-w-7xl grid gap-12 md:grid-cols-2 md:gap-20 items-center"
        >
          <div>
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">Our Mission</p>
            <h2 className="font-serif text-4xl leading-[0.95] tracking-[0.01em] md:text-5xl">
              Specialty coffee,<br /> made accessible.
            </h2>
          </div>
          <div className="space-y-5 text-muted-foreground leading-relaxed">
            <p>
              Specialty coffee has a reputation for being intimidating. We think that&apos;s a
              problem worth fixing. The farmers and producers who grow exceptional coffee deserve a
              wider audience — and drinkers deserve to know the story of what&apos;s in their cup.
            </p>
            <p>
              Aspen Coffee Co was founded in Pittsburgh with a straightforward belief: great coffee
              and honest information should go together. We source transparently, roast carefully,
              and share what we learn so every bag means something.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Farm to Cup Journey */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">The Journey</p>
            <h2 className="font-serif text-4xl leading-[0.98] tracking-[0.01em] md:text-5xl">
              How coffee gets to you
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{opacity: 0, y: 20}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.65, delay: i * 0.1}}
                className="rounded-[1.6rem] border border-[#e4d7c8] bg-white/72 p-7 shadow-[0_14px_40px_rgba(78,56,36,0.06)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_14px_40px_rgba(0,0,0,0.2)]"
              >
                <span className="block font-serif text-[3rem] leading-none text-[#c9a97a]/30 dark:text-[#c9a97a]/20 mb-5 select-none">
                  {step.number}
                </span>
                <h3 className="font-serif text-2xl leading-tight mb-3 text-foreground">{step.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">Our Values</p>
            <h2 className="font-serif text-4xl leading-[0.98] tracking-[0.01em] md:text-5xl">How we make decisions</h2>
          </div>
          <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
            {VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.article
                  key={value.title}
                  initial={{opacity: 0, y: 24}}
                  whileInView={{opacity: 1, y: 0}}
                  viewport={{once: true}}
                  transition={{duration: 0.7, delay: index * 0.08}}
                  className="rounded-[1.6rem] border border-[#e4d7c8] bg-white/72 p-7 shadow-[0_14px_40px_rgba(78,56,36,0.06)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_14px_40px_rgba(0,0,0,0.2)]"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ddcdbb] bg-[#f8efe3] text-[#7b624a] dark:border-white/20 dark:bg-white/10 dark:text-[#d8c2aa]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-5 font-serif text-[1.75rem] leading-[0.98] text-foreground">{value.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{value.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#decfbe] bg-[linear-gradient(180deg,#f5e9da_0%,#f0e1cf_100%)] p-8 text-center shadow-[0_22px_50px_rgba(88,63,40,0.08)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] dark:shadow-[0_22px_50px_rgba(0,0,0,0.25)] md:p-16">
          <Leaf className="mx-auto mb-6 h-6 w-6 text-[#7a6249] dark:text-[#d8c1a8]" />
          <h2 className="mx-auto max-w-2xl font-serif text-4xl leading-[0.98] tracking-[0.01em] text-foreground md:text-5xl">
            Every coffee has a story.<br className="hidden sm:block" /> Find yours.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Browse our current offerings — each one comes with the origin story, producer notes, and
            context you need to truly appreciate what&apos;s in your cup.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <NavLink
              to="/collections/coffee"
              className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-white/80 px-6 py-3 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-white dark:border-white/20 dark:bg-white/10"
            >
              Browse Current Coffees
              <ArrowRight className="h-4 w-4" />
            </NavLink>
            <NavLink
              to="/fieldnotes"
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-6 py-3 text-xs uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-foreground"
            >
              Read Field Notes
            </NavLink>
          </div>
        </div>
      </section>

    </div>
  );
}

/** @typedef {import('./+types/about').Route} Route */
