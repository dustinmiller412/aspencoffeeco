import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {Logo} from '~/components/Header';
import {PageHeader} from '~/components/PageHeader';

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
    <div>
      <PageHeader eyebrow="Our story" title="About Aspen" dark>
        Small-batch coffee roasted in Pittsburgh, PA, and the people and places behind every cup.
      </PageHeader>

      {/* Story */}
      <section className="px-6 pb-20 pt-14 md:pb-28 md:pt-20">
        <div className="mx-auto grid max-w-7xl gap-14 md:grid-cols-[1fr_1.4fr]">
          <div className="md:sticky md:top-32 md:self-start">
            <p className="eyebrow mb-4">How it started</p>
            <h2 className="m-0 text-5xl md:text-6xl">A washed Tanzanian peaberry opened the door.</h2>
            <Logo variant="badge" label="" className="mt-10 h-36 text-ink" />
          </div>
          <motion.div
            initial={{opacity: 0, y: 20}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true}}
            transition={{duration: 0.8, ease: [0.22, 1, 0.36, 1]}}
            className="block-card space-y-6 p-8 text-lg leading-relaxed md:p-12"
          >
            <p className="text-xl font-semibold leading-relaxed">
              Aspen Coffee Co grew out of a personal obsession with understanding coffee: where it comes
              from, how it&apos;s made, and what makes each cup different. I built it because I couldn&apos;t
              stop asking questions.
            </p>
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
          </motion.div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="on-ink bg-ink px-6 py-24 text-paper-2 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow mb-4 text-glow">Our philosophy</p>
          <h2 className="mb-14 text-5xl md:text-7xl">What we believe</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {PHILOSOPHY.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{opacity: 0, y: 16}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{duration: 0.6, delay: index * 0.08}}
                className="block-card p-8 text-ink"
              >
                <span className="mb-6 inline-flex h-12 w-12 items-center justify-center border-2 border-ink bg-cta font-display text-lg">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-4 text-3xl">{item.label}</h3>
                <p className="text-sm leading-relaxed md:text-base">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pt-24">
        <motion.div
          initial={{opacity: 0, y: 16}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.7}}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-5xl md:text-6xl">Specialty coffee is something you can be part of.</h2>
          <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed">
            Browse what we&apos;re currently roasting. Each bag comes with the origin story, producer context,
            and the details that help the cup make sense.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <NavLink to="/collections/coffee" className="btn-cta">
              Browse current coffees
              <ArrowRight className="h-4 w-4" />
            </NavLink>
            <NavLink to="/fieldnotes" className="btn-outline">
              Read field notes
            </NavLink>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

/** @typedef {import('./+types/about').Route} Route */
