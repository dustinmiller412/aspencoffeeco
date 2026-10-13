import {Link} from 'react-router';
import {ArrowRight} from 'lucide-react';

/**
 * @param {{note: {title: string; slug: string; category: string; coverImage?: string; excerpt: string; date: string; tags?: string[]}}}
 */
export function NoteCard({note}) {
  return (
    <Link
      to={`/fieldnotes/${note.slug}`}
      prefetch="intent"
      className="block-card group flex h-full flex-col text-ink no-underline transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:no-underline hover:shadow-block-lg"
    >
      {note.coverImage ? (
        <div className="aspect-[16/10] overflow-hidden border-b-2 border-ink bg-paper">
          <img
            src={note.coverImage}
            alt={note.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
            loading="lazy"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="eyebrow mb-3 flex items-center justify-between gap-3 opacity-70">
          <span>{note.category}</span>
          <time dateTime={note.date}>{new Date(note.date).toLocaleDateString()}</time>
        </div>
        <h3 className="text-2xl">{note.title}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed">{note.excerpt}</p>
        {note.tags?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span key={tag} className="eyebrow border-2 border-ink bg-pop-2 px-2 py-0.5 text-[0.6rem]">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <span className="eyebrow mt-auto inline-flex items-center gap-2 pt-5">
          Read note
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
