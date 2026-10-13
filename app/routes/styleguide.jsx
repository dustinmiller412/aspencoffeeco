import {useState} from 'react';
import {ArrowRight} from 'lucide-react';
import {ContourDivider} from '~/components/ContourDivider';
import {Logo} from '~/components/Header';

// ponytail: temporary route for picking palette/font/logo. Delete after the redesign lands.

export const meta = () => [
  {title: 'Styleguide | Aspen Coffee Co'},
  {name: 'robots', content: 'noindex'},
];

export const links = () => [
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Archivo+Black&family=Bricolage+Grotesque:wght@800&family=Dela+Gothic+One&display=swap',
  },
];

const PALETTES = [
  {
    name: 'Industrial Modern',
    note: 'Warm grey, charcoal, signal orange, steel blue, yellow.',
    vars: {
      '--ink': '#252C30',
      '--paper': '#E8E5DE',
      '--paper-2': '#F3F1EC',
      '--cta': '#EF623C',
      '--cta-ink': '#252C30',
      '--pop-1': '#AFC4D0',
      '--pop-2': '#F5C744',
    },
    onPop1: 'var(--ink)',
    onPop2: 'var(--ink)',
  },
];

const FONTS = [
  {name: 'Archivo Black', stack: "'Archivo Black', sans-serif"},
  {name: 'Bricolage Grotesque', stack: "'Bricolage Grotesque', sans-serif"},
  {name: 'Dela Gothic One', stack: "'Dela Gothic One', sans-serif"},
];

const LOGOS = ['horizontal', 'stacked', 'badge', 'mark', 'wordmark'];

const SAMPLE_COFFEES = [
  {title: 'Huila Pink Bourbon', type: 'Colombia · Washed', price: '22', notes: ['Raspberry', 'Rose', 'Cacao nib'], bg: 'var(--pop-1)', fg: 'onPop1'},
  {title: 'Guji Natural', type: 'Ethiopia · Natural', price: '24', notes: ['Blueberry', 'Jasmine', 'Brown sugar'], bg: 'var(--pop-2)', fg: 'onPop2'},
  {title: 'Allegheny Blend', type: 'House blend', price: '18', notes: ['Milk choc', 'Toffee', 'Almond'], bg: 'var(--cta)', fg: 'cta', soldOut: true},
  {title: 'Night Shift', type: 'Dark roast', price: '18', notes: ['Molasses', 'Smoke', 'Dark choc'], bg: 'var(--ink)', fg: 'ink'},
];

function tileText(coffee, palette) {
  if (coffee.fg === 'cta') return 'var(--cta-ink)';
  if (coffee.fg === 'ink') return 'var(--paper-2)';
  return palette[coffee.fg];
}

function CoffeeTile({notes, bg, fg}) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1 p-6 text-center font-display uppercase leading-[1.05] tracking-[0.12em]"
      style={{background: bg, color: fg, fontSize: 'clamp(1.1rem, 2.4vw, 1.7rem)'}}
    >
      {notes.map((n) => (
        <span key={n}>{n}</span>
      ))}
    </div>
  );
}

export default function Styleguide() {
  const [p, setP] = useState(0);
  const [f, setF] = useState(0);
  const palette = PALETTES[p];

  return (
    <div
      className="bg-paper font-sans text-ink"
      style={{...palette.vars, '--font-display': FONTS[f].stack}}
    >
      {/* Controls */}
      <div className="sticky top-0 z-20 border-b-2 border-ink bg-paper-2 px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-3">
            {PALETTES.map((pal, i) => (
              <button
                key={pal.name}
                type="button"
                onClick={() => setP(i)}
                className={`flex items-center gap-3 border-2 border-ink px-3 py-2 text-left ${i === p ? 'bg-ink text-paper' : 'bg-paper'}`}
              >
                <span className="flex">
                  {['--ink', '--paper', '--cta', '--pop-1', '--pop-2'].map((k) => (
                    <span key={k} className="h-5 w-5 border border-ink" style={{background: pal.vars[k]}} />
                  ))}
                </span>
                <span className="text-sm font-semibold">{pal.name}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            {FONTS.map((font, i) => (
              <button
                key={font.name}
                type="button"
                onClick={() => setF(i)}
                className={`border-2 border-ink px-3 py-2 text-sm uppercase ${i === f ? 'bg-ink text-paper' : 'bg-paper'}`}
                style={{fontFamily: font.stack}}
              >
                {font.name}
              </button>
            ))}
          </div>
        </div>
        <p className="mx-auto mt-2 max-w-7xl text-sm opacity-70">{palette.note}</p>
      </div>

      {/* Announcement + header */}
      <div className="bg-ink py-2 text-center text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-paper">
        Free shipping over $40 · Roasted every Tuesday in Pittsburgh
      </div>
      <div className="flex items-center justify-between border-b-2 border-ink bg-pop-1 px-6 py-4">
        <span className="eyebrow" style={{color: palette.onPop1}}>Shop · Subscribe · Learn</span>
        <span className="display text-2xl md:text-3xl" style={{color: palette.onPop1}}>Aspen Coffee Co</span>
        <span className="eyebrow" style={{color: palette.onPop1}}>Cart (0)</span>
      </div>

      {/* Hero */}
      <section className="bg-ink px-6 py-24 text-paper md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow mb-6 text-cta">Small-batch · Pittsburgh, PA</p>
          <h1 className="display max-w-4xl text-6xl md:text-8xl">Coffee worth slowing down for</h1>
          <p className="mt-6 max-w-xl text-lg opacity-80">
            Single origins and house blends, roasted in small batches and shipped within days of roasting.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <a href="#cards" className="btn-cta">Shop coffee <ArrowRight className="h-4 w-4" /></a>
            <a href="#cards" className="btn-outline">Subscribe & save</a>
          </div>
        </div>
      </section>

      {/* Marquee band */}
      <div className="overflow-hidden whitespace-nowrap border-y-2 border-ink bg-cta py-4 text-cta-ink">
        <div className="display inline-flex animate-[marquee_22s_linear_infinite] gap-10 text-xl">
          {[...Array(2)].flatMap((_, k) =>
            ['Small-batch roasted', 'Single origin', 'Roasted in Pittsburgh', 'Rotating selections'].map((t) => (
              <span key={`${k}${t}`}>{t} ✦</span>
            )),
          )}
        </div>
      </div>

      {/* Cards */}
      <section id="cards" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow mb-4">Current lineup</p>
          <h2 className="display mb-12 text-5xl md:text-7xl">Fresh off the roaster</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {SAMPLE_COFFEES.map((c) => (
              <a
                key={c.title}
                href="#cards"
                className="block-card group flex h-full flex-col text-ink no-underline transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:no-underline hover:shadow-block-lg"
              >
                <div className="relative aspect-square overflow-hidden border-b-2 border-ink">
                  <CoffeeTile notes={c.notes} bg={c.bg} fg={tileText(c, palette)} />
                  <img
                    src="/images/blends.png"
                    alt=""
                    className="absolute inset-0 h-full w-full bg-paper object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="eyebrow opacity-70">{c.type}</p>
                  <h3 className="display text-xl">{c.title}</h3>
                  <div className="mt-auto flex items-baseline justify-between pt-4">
                    <span className="font-display text-lg">${c.price}</span>
                    {c.soldOut && <span className="eyebrow opacity-70">Sold out</span>}
                  </div>
                </div>
              </a>
            ))}
          </div>
          <p className="mt-6 text-sm opacity-70">Hover a card to see the tile swap to the bag photo.</p>
        </div>
      </section>

      {/* Buttons + type */}
      <section className="border-t-2 border-ink bg-paper-2 px-6 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow mb-6">Buttons</p>
            <div className="flex flex-wrap gap-4">
              <button type="button" className="btn-cta">Add to cart</button>
              <button type="button" className="btn-ink">Subscribe</button>
              <button type="button" className="btn-outline">Learn more</button>
            </div>
            <p className="eyebrow mb-4 mt-10">Variant pills</p>
            <div className="flex flex-wrap gap-3">
              {['12 oz', '2 lb', '5 lb'].map((s, i) => (
                <span key={s} className={`border-2 border-ink px-4 py-2 font-display text-sm uppercase ${i === 0 ? 'bg-ink text-paper' : ''}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow mb-6">Type</p>
            <p className="display text-6xl">Display</p>
            <p className="display mt-2 text-3xl">Section heading</p>
            <p className="eyebrow mt-4">Eyebrow label</p>
            <p className="mt-4 max-w-md">
              Body copy in Manrope. Every coffee starts with people: producers, pickers, processors and roasters.
            </p>
          </div>
        </div>
      </section>

      {/* Tile spec */}
      <ContourDivider className="bg-paper-2 text-ink" />
      <section className="bg-ink px-6 py-24 text-paper">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow mb-4 text-cta">For Canva</p>
          <h2 className="display mb-10 text-5xl md:text-6xl">Coffee tile spec</h2>
          <div className="grid gap-12 lg:grid-cols-2">
            <ul className="space-y-4 text-lg">
              <li><strong>Canvas:</strong> 1600 × 1600 px, square, no border (the site draws it).</li>
              <li><strong>Text:</strong> 3–4 tasting notes, one per line, all caps, {FONTS[f].name}, letter spacing ~120 (0.12em), centered.</li>
              <li><strong>Color:</strong> one flat background, picked by roast:
                <ul className="mt-2 space-y-1 pl-4 text-base opacity-90">
                  <li>Light → pop 1 · Medium → pop 2 · Blends → CTA · Dark → ink</li>
                </ul>
              </li>
              <li><strong>Hex values:</strong>{' '}
                {['--ink', '--paper', '--cta', '--pop-1', '--pop-2'].map((k) => (
                  <code key={k} className="mr-2 font-mono text-sm">{palette.vars[k]}</code>
                ))}
              </li>
              <li><strong>Shopify:</strong> tile is the <em>first</em> image on the product, bag photo second.</li>
            </ul>
            <div className="grid grid-cols-2 gap-4">
              {SAMPLE_COFFEES.map((c) => (
                <div key={c.title} className="aspect-square border-2 border-paper">
                  <CoffeeTile notes={c.notes} bg={c.bg} fg={tileText(c, palette)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter band */}
      <ContourDivider className="bg-ink text-cta" />
      <section className="bg-cta px-6 py-16 text-cta-ink">
        <div className="mx-auto max-w-7xl">
          <h2 className="display text-4xl md:text-5xl">New roasts, first dibs</h2>
          <p className="mt-2">Limited lots sell out. Get on the list.</p>
          <div className="mt-6 flex max-w-xl border-2 border-ink shadow-block">
            <input className="flex-1 bg-paper-2 px-4 py-3 text-ink outline-none" placeholder="you@email.com" />
            <button type="button" className="border-l-2 border-ink bg-ink px-6 font-display uppercase text-paper">Sign up</button>
          </div>
        </div>
      </section>

      {/* Logos */}
      <section className="border-t-2 border-ink px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow mb-6">Logos (public/brand/), recolored per background</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {LOGOS.flatMap((variant) => [
              <div key={`${variant}-paper`} className="flex h-48 items-center justify-center border-2 border-ink bg-paper-2 p-8 text-ink">
                <Logo variant={variant} label={variant} className="max-h-full max-w-full" />
              </div>,
              <div key={`${variant}-ink`} className="flex h-48 items-center justify-center border-2 border-ink bg-ink p-8 text-paper-2">
                <Logo variant={variant} label={variant} className="max-h-full max-w-full" />
              </div>,
            ])}
          </div>
        </div>
      </section>
    </div>
  );
}
