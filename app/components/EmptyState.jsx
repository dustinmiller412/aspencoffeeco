import {Link} from 'react-router';

/**
 * Blocky empty-state card with an optional call to action.
 * @param {{
 *   title: string;
 *   body: React.ReactNode;
 *   cta?: {to: string; label: string};
 *   tone?: string;
 * }}
 */
export function EmptyState({title, body, cta, tone = 'bg-pop-2'}) {
  return (
    <div className="block-card overflow-hidden">
      <div className={`border-b-2 border-ink px-6 py-8 md:px-10 ${tone}`}>
        <p className="m-0 font-display text-3xl uppercase leading-none md:text-4xl">{title}</p>
      </div>
      <div className="flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10">
        <p className="m-0 max-w-md text-base leading-relaxed">{body}</p>
        {cta ? (
          <Link to={cta.to} className="btn-cta self-start md:self-auto">
            {cta.label} <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
