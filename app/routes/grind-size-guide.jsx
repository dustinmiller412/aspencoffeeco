import {NavLink} from 'react-router';
import {Coffee} from 'lucide-react';

/** @type {Route.MetaFunction} */
export const meta = () => {
  return [{title: 'Aspen Coffee Co | Grind Size Guide'}];
};

const BREW_METHODS = [
  {
    id: 'autodrip',
    brewMethod: 'Autodrip',
    grindSize: 'Medium/Coarse',
    looksLike: 'Sea salt',
    image: '/images/Medium_Coarse.jpg',
  },
  {
    id: 'espresso',
    brewMethod: 'Espresso',
    grindSize: 'Fine',
    looksLike: 'Cinnamon',
    image: '/images/Fine.jpg',
  },
  {
    id: 'pour-over',
    brewMethod: 'Pour Over',
    grindSize: 'Medium',
    looksLike: 'Rough beach sand',
    image: '/images/Medium.jpg',
  },
  {
    id: 'french-press',
    brewMethod: 'French Press',
    grindSize: 'Coarse',
    looksLike: 'Coarsely cracked pepper',
    image: '/images/Coarse.jpg',
  },
  {
    id: 'aeropress',
    brewMethod: 'Aeropress',
    grindSize: 'Medium-Fine',
    looksLike: 'Fine table salt',
    image: '/images/Medium-fine.jpg',
  },
  {
    id: 'cold-brew',
    brewMethod: 'Cold Brew',
    grindSize: 'Coarse',
    looksLike: 'Coarsely cracked pepper',
    image: '/images/Coarse.jpg',
  },
  {
    id: 'siphon',
    brewMethod: 'Siphon',
    grindSize: 'Medium',
    looksLike: 'Rough beach sand',
    image: '/images/Medium.jpg',
  },
];

export default function GrindSizeGuide() {
  return (
    <div className="bg-[linear-gradient(180deg,#fffdfa_0%,#f8f0e6_42%,#f5ebde_72%,#fffdfa_100%)] px-6 pb-24 pt-32 dark:bg-[linear-gradient(180deg,#13110f_0%,#1b1714_42%,#17130f_100%)] md:pt-36">
      <div className="mx-auto max-w-6xl">
        <header className="mb-14 text-center">
          <h1 className="mt-14 font-serif text-5xl leading-[0.96] tracking-[0.01em] text-foreground md:text-6xl">
            Grind Size Guide
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Use this quick reference to dial in your grind before brewing. Grind consistency changes extraction,
            cup balance, and how your coffee tastes.
          </p>
        </header>

        <div className="space-y-10 md:space-y-12">
          {BREW_METHODS.map((item) => (
            <section
              key={item.id}
              className="rounded-[1.75rem] border border-[#e4d7c8] bg-white/78 p-6 shadow-[0_16px_40px_rgba(77,55,37,0.06)] dark:border-white/10 dark:bg-white/5 dark:shadow-[0_16px_40px_rgba(0,0,0,0.22)] md:p-8"
            >
              <h2 className="mb-8 text-center font-serif text-4xl uppercase tracking-[0.08em] text-foreground md:text-5xl">
                {item.brewMethod}
              </h2>

              <div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.7fr_1fr]">
                <div className="flex justify-center md:justify-start">
                  <div className="inline-flex h-24 w-24 items-center justify-center rounded-full border border-[#ddccb8] bg-[#f8efe3] text-[#7a6249] dark:border-white/20 dark:bg-white/10 dark:text-[#d8c1a8] md:h-28 md:w-28">
                    <Coffee className="h-11 w-11" strokeWidth={1.5} />
                  </div>
                </div>

                <div>
                  <div className="border-y border-[#d8c8b6] py-3 text-sm uppercase tracking-[0.1em] text-foreground dark:border-white/15 md:text-base">
                    <span className="font-semibold text-muted-foreground">Grind Size:</span> {item.grindSize}
                  </div>
                  <div className="border-b border-[#d8c8b6] py-3 text-sm uppercase tracking-[0.1em] text-foreground dark:border-white/15 md:text-base">
                    <span className="font-semibold text-muted-foreground">Looks Like:</span> {item.looksLike}
                  </div>
                </div>

                <div className="flex justify-center md:justify-end">
                  <img
                    src={item.image}
                    alt={`${item.brewMethod} grind size example`}
                    className="h-44 w-44 rounded-full object-contain md:h-52 md:w-52"
                    loading="lazy"
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** @typedef {import('./+types/grind-size-guide').Route} Route */
