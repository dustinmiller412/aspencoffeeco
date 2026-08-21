import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';

/** @type {Route.MetaFunction} */
export const meta = () => {
  return [{title: 'About | Aspen Coffee Co'}];
};

const PHILOSOPHY = [
  {
    label: 'Coffee Is Human',
    text: 'Every coffee starts with people: producers, pickers, processors, roasters, brewers, and the person drinking it. Aspen exists to make that chain feel less invisible and to connect the cup back to the land, labor, and decisions that shaped it.',
  },
  {
    label: 'Curiosity Over Gatekeeping',
    text: 'We care about origin, variety, process, roast, and brewing, but those things should open coffee up, not close people out. Specialty coffee is at its best when it helps people notice more, taste more, and feel invited in.',
  },
  {
    label: 'The Cup Comes First',
    text: 'Stories, tasting notes, and technique matter, but they should serve the experience of drinking the coffee. At Aspen, we roast with intention, share what we are learning, and keep the focus where it belongs: on a coffee that feels thoughtful, approachable, and worth paying attention to.',
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
          <p className="mb-5 text-xs uppercase tracking-[0.24em] text-muted-foreground">The Story Behind Aspen</p>
          <h1 className="font-serif text-5xl leading-[1.05] tracking-[0.01em] text-foreground md:text-6xl lg:text-7xl">
            Every coffee has a story.<br className="hidden sm:block" /> We're here to connect you to it.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Aspen Coffee Co grew out of a personal obsession with understanding coffee: where it comes from,
            how it&apos;s made, and what makes each cup different. I built it because I couldn&apos;t stop asking questions.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <NavLink
              to="/collections/coffee"
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Shop Coffee
              <ArrowRight className="h-4 w-4" />
            </NavLink>
            <NavLink
              to="/fieldnotes"
              className="inline-flex items-center gap-2 border border-border/70 px-6 py-3 text-xs uppercase tracking-[0.18em] text-foreground transition-colors hover:bg-background/70"
            >
              Read Field Notes
            </NavLink>
          </div>
        </motion.div>
      </section>

      {/* Story */}
      <section className="px-6 pb-14">
        <motion.div
          initial={{opacity: 0, y: 20}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
          className="mx-auto max-w-2xl"
        >
          <p className="mb-6 text-xs uppercase tracking-[0.24em] text-muted-foreground">How It Started</p>
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              Around 2020, I walked into a coffee shop that roasted on site. I had never really seen coffee
              roasting up close before. Until then, coffee was something I enjoyed, but watching it being
              roasted made it feel alive, like there was a whole world behind the cup that I had barely noticed.
            </p>
            <p>
              The coffee that changed things for me was a washed Tanzanian Peaberry from that shop. It was
              bright, clean, and expressive in a way I did not know coffee could be. That cup opened a door.
            </p>
            <p>
              From there, I started paying attention differently. I wanted to understand why one coffee tasted
              so different from another: origin, processing, variety, roast level, and all the small choices
              that shape the final cup. Eventually, buying roasted coffee was not enough for the kind of
              curiosity I had developed. I wanted to experiment and understand those differences for myself,
              so I started roasting at home.
            </p>
            <p>
              Roasting became a way to learn by doing: cupping samples, comparing profiles, tasting coffees
              across different roast levels, and trying to understand what each coffee wanted to be.
            </p>
            <p>
              Later, visiting farms in Honduras and spending time with producers changed that understanding
              again. Coffee is easy to reduce to tasting notes, scores, and labels. But it begins with people,
              land, labor, weather, and decisions made long before it ever reaches a roaster.
            </p>
            <p>
              Aspen grew out of all of that: curiosity, craft, and the belief that coffee should connect us
              more deeply to the people and places behind it.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-2xl">
          <p className="mb-10 text-xs uppercase tracking-[0.24em] text-muted-foreground">Our Philosophy</p>
          <div className="divide-y divide-border/50">
            {PHILOSOPHY.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{opacity: 0, y: 16}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.6, delay: index * 0.08}}
                className="py-8 first:pt-0 last:pb-0"
              >
                <h3 className="font-serif text-2xl text-foreground mb-3">{item.label}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground md:text-base">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24">
        <motion.div
          initial={{opacity: 0, y: 16}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.7}}
          className="mx-auto max-w-2xl border-t border-border/40 pt-16 text-center"
        >
          <h2 className="font-serif text-4xl leading-[0.98] tracking-[0.01em] text-foreground md:text-5xl">
            Specialty coffee is something<br className="hidden sm:block" /> you can be part of.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base">
            Browse what we&apos;re currently roasting. Each bag comes with the origin story, producer context,
            and the details that help the cup make sense.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <NavLink
              to="/collections/coffee"
              className="inline-flex items-center gap-2 bg-primary px-6 py-3 text-xs uppercase tracking-[0.18em] text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Browse Current Coffees
              <ArrowRight className="h-4 w-4" />
            </NavLink>
            <NavLink
              to="/fieldnotes"
              className="inline-flex items-center gap-2 border border-border/60 px-6 py-3 text-xs uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-foreground"
            >
              Read Field Notes
            </NavLink>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

/** @typedef {import('./+types/about').Route} Route */
