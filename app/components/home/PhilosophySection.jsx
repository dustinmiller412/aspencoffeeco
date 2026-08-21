import {motion} from 'framer-motion';

const PILLARS = [
  {
    title: 'Sourced',
    text: "Every coffee in our lineup started as a sample we couldn't stop thinking about. We cup it, research the farm, and look hard at how they treat their land and their community. The cup has to be exceptional. So does the story behind it.",
    borderTone: 'border-t-[#8d9a6f] dark:border-t-[#a8b487]',
  },
  {
    title: 'Roasted',
    text: "Small-batch, roasted in Pittsburgh. Every coffee is developed to shine across brew methods, so how you brew it is your call, not ours.",
    borderTone: 'border-t-[#8f7d65] dark:border-t-[#b29b7f]',
  },
  {
    title: 'Delivered',
    text: "Whole bean orders ship fresh. Ground orders are given a few days to degas first, because freshly ground coffee that hasn't rested properly tastes worse, not better. We'd rather ship it right than ship it fast.",
    borderTone: 'border-t-[#75685b] dark:border-t-[#9c8e7f]',
  },
];

export default function PhilosophySection() {
  return (
    <section className="px-6 pt-16 pb-28 bg-[linear-gradient(180deg,rgba(247,242,235,0.55),rgba(250,247,242,0.2))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{opacity: 0, y: 30}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.8}}
          className="text-center mb-14"
        >
          <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground mb-4">
            Our Process
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-medium leading-[0.98] tracking-[0.01em] max-w-xl mx-auto">
            From seed to cup, with intention.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{opacity: 0, y: 30}}
              whileInView={{opacity: 1, y: 0}}
              viewport={{once: true}}
              transition={{delay: i * 0.15, duration: 0.8}}
              className={`rounded-2xl border border-[#e7ddd1] border-t-2 ${pillar.borderTone} bg-white/72 px-8 py-10 shadow-[0_18px_40px_rgba(102,72,48,0.045)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_40px_rgba(0,0,0,0.22)]`}
            >
              <h3 className="font-serif text-[2rem] leading-none font-medium mb-4">{pillar.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-xs">
                {pillar.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
