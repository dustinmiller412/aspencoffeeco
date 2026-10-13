/**
 * Full-bleed colored title band used at the top of inner pages.
 * `dark` gives the charcoal treatment used by the homepage hero.
 * @param {{
 *   eyebrow?: React.ReactNode;
 *   title: React.ReactNode;
 *   children?: React.ReactNode;
 *   tone?: string;
 *   dark?: boolean;
 * }}
 */
export function PageHeader({eyebrow, title, children, tone = 'bg-pop-2', dark = false}) {
  const colors = dark ? 'on-ink bg-ink text-paper-2' : tone;
  return (
    <header className={`border-b-2 border-ink px-6 py-16 md:py-24 ${colors}`}>
      <div className="mx-auto max-w-7xl">
        {eyebrow ? <p className={`eyebrow mb-5 ${dark ? 'text-glow' : ''}`}>{eyebrow}</p> : null}
        <h1 className="m-0 max-w-5xl text-[clamp(2.75rem,7vw,6rem)] leading-[0.92]">{title}</h1>
        {children ? <div className="mt-6 max-w-2xl text-lg">{children}</div> : null}
      </div>
    </header>
  );
}
