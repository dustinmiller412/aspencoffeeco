import {PageHeader} from '~/components/PageHeader';

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
    methodIcon: '/images/moccamasterweb2.png',
    image: '/images/Medium_Coarse.jpg',
  },
  {
    id: 'espresso',
    brewMethod: 'Espresso',
    grindSize: 'Fine',
    looksLike: 'Cinnamon',
    methodIcon: '/images/espresso.png',
    image: '/images/Fine.jpg',
  },
  {
    id: 'pour-over',
    brewMethod: 'Pour Over',
    grindSize: 'Medium',
    looksLike: 'Rough beach sand',
    methodIcon: '/images/v60.png',
    image: '/images/Medium.jpg',
  },
  {
    id: 'french-press',
    brewMethod: 'French Press',
    grindSize: 'Coarse',
    looksLike: 'Coarsely cracked pepper',
    methodIcon: '/images/press.png',
    image: '/images/Coarse.jpg',
  },
  {
    id: 'aeropress',
    brewMethod: 'Aeropress',
    grindSize: 'Medium-Fine',
    looksLike: 'Fine table salt',
    methodIcon: '/images/aeropress.png',
    image: '/images/Medium-fine.jpg',
  },
  {
    id: 'cold-brew',
    brewMethod: 'Cold Brew',
    grindSize: 'Coarse',
    looksLike: 'Coarsely cracked pepper',
    methodIcon: '/images/coldbrew.svg',
    image: '/images/Coarse.jpg',
  },
  {
    id: 'siphon',
    brewMethod: 'Siphon',
    grindSize: 'Medium',
    looksLike: 'Rough beach sand',
    methodIcon: '/images/siphon.webp',
    image: '/images/Medium.jpg',
  },
];

const TONES = ['bg-pop-1', 'bg-cta', 'bg-pop-2'];

export default function GrindSizeGuide() {
  return (
    <div>
      <PageHeader eyebrow="Brew better" title="Grind size guide" tone="bg-cta">
        Use this quick reference to dial in your grind before brewing. Grind consistency changes extraction,
        cup balance, and how your coffee tastes.
      </PageHeader>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 md:grid-cols-2 md:py-20">
        {BREW_METHODS.map((item, i) => (
          <section key={item.id} className="block-card flex flex-col p-0">
            <div className={`flex items-center justify-between gap-4 border-b-2 border-ink px-6 py-5 ${TONES[i % TONES.length]}`}>
              <h2 className="m-0 text-3xl md:text-4xl">{item.brewMethod}</h2>
              <img
                src={item.methodIcon}
                alt={`${item.brewMethod} brewer icon`}
                className="h-16 w-16 object-contain"
                loading="lazy"
                style={
                  item.id === 'siphon' || item.id === 'cold-brew'
                    ? {filter: 'brightness(0) saturate(100%)'}
                    : undefined
                }
              />
            </div>

            <div className="grid flex-1 grid-cols-[1fr_auto] items-center gap-6 p-6">
              <dl className="m-0 space-y-4">
                <div>
                  <dt className="eyebrow opacity-70">Grind size</dt>
                  <dd className="m-0 font-display text-2xl uppercase">{item.grindSize}</dd>
                </div>
                <div>
                  <dt className="eyebrow opacity-70">Looks like</dt>
                  <dd className="m-0 text-lg font-semibold">{item.looksLike}</dd>
                </div>
              </dl>
              <img
                src={item.image}
                alt={`${item.brewMethod} grind size example`}
                className="h-32 w-32 border-2 border-ink object-cover md:h-40 md:w-40"
                loading="lazy"
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/** @typedef {import('./+types/grind-size-guide').Route} Route */
