import {motion} from 'framer-motion';
import {Flame, Leaf, Truck} from 'lucide-react';

const PILLARS = [
  {
    number: '01',
    title: 'Sourced',
    text: "Every coffee in our lineup started as a sample we couldn't stop thinking about. We cup it, research the farm, and look hard at how they treat their land and their community. The cup has to be exceptional. So does the story behind it.",
    icon: Leaf,
    tone: 'bg-pop-1',
  },
  {
    number: '02',
    title: 'Roasted',
    text: 'Small-batch, roasted in Pittsburgh. Every coffee is developed to shine across brew methods, so how you brew it is your call, not ours.',
    icon: Flame,
    tone: 'bg-cta',
  },
  {
    number: '03',
    title: 'Delivered',
    text: "Whole bean orders ship fresh. Ground orders are given a few days to degas first, because freshly ground coffee that hasn't rested properly tastes worse, not better. We'd rather ship it right than ship it fast.",
    icon: Truck,
    tone: 'bg-pop-2',
  },
];

export default function PhilosophySection() {
  return (
    <section className="on-ink bg-ink px-6 py-24 text-paper-2 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{opacity: 0, y: 30}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.8}}
          className="mb-14"
        >
          <p className="eyebrow mb-4 text-glow">Our process</p>
          <h2 className="max-w-3xl text-5xl md:text-7xl">From seed to cup, with intention.</h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;

            return (
              <motion.div
                key={pillar.number}
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: i * 0.15, duration: 0.8}}
                className="block-card flex flex-col text-ink"
              >
                <div className={`flex items-center justify-between border-b-2 border-ink px-6 py-4 ${pillar.tone}`}>
                  <span className="font-display text-4xl">{pillar.number}</span>
                  <Icon className="h-7 w-7" strokeWidth={2.25} />
                </div>
                <div className="px-6 py-8">
                  <h3 className="mb-4 text-3xl">{pillar.title}</h3>
                  <p className="text-sm leading-relaxed">{pillar.text}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
