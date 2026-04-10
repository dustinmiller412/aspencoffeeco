import {Link, useLoaderData} from 'react-router';
import {ArrowLeft} from 'lucide-react';
import {getNoteBySlug, renderMarkdown} from '~/lib/notes.server';
import '~/styles/note-prose.css';
/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `${data?.note.title ?? 'Note'} | Aspen Coffee Co`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  const slug = params.slug;

  if (!slug) {
    throw new Response('Not found', {status: 404});
  }

  const note = getNoteBySlug(slug);

  if (!note) {
    throw new Response('Not found', {status: 404});
  }

  return {
    note: {
      ...note,
      html: renderMarkdown(note.content),
    },
  };
}

export default function NoteDetail() {
  /** @type {{note: {title: string; date: string; category: string; coverImage: string; excerpt: string; tags: string[]; html: string}}} */
  const {note} = useLoaderData();

  const formattedDate = new Date(note.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="min-h-screen bg-[#FAF8F4] dark:bg-background">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <div className="relative pt-40 md:pt-44">

        {/* Cover image — cinematic, full-bleed within max-w-3xl */}
        {note.coverImage ? (
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-[#e7ddd1] shadow-lg dark:border-white/10">
              <img
                src={note.coverImage}
                alt={note.title}
                className="aspect-[16/8] w-full object-cover"
                loading="eager"
              />
              {/* gradient vignette — bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* gradient vignette — top (for nav clearance) */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />

              {/* Back link — floated over the image */}
              <div className="absolute left-5 top-5">
                <Link
                  to="/fieldnotes"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/30 px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.16em] text-white/90 backdrop-blur-sm transition-colors hover:bg-black/50"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Field Notes
                </Link>
              </div>

              {/* Tags — bottom-left of image */}
              {note.tags?.length ? (
                <div className="absolute bottom-5 left-5 flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <span
                      key={`${note.title}-${tag}`}
                      className="rounded-full border border-white/20 bg-black/30 px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.13em] text-white/80 backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* No cover image — show back link inline */
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Link
              to="/fieldnotes"
              className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to field notes
            </Link>
          </div>
        )}

        {/* ── Title block ─────────────────────────────────────────── */}
        <div className="mx-auto max-w-2xl px-4 pb-2 pt-8 sm:px-6">

          {/* Meta row */}
          <div className="mb-5 flex flex-wrap items-center gap-2 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            {note.category && (
              <>
                <span>{note.category}</span>
                <span aria-hidden="true" className="text-[#c9bfb3]">&middot;</span>
              </>
            )}
            <time dateTime={note.date}>{formattedDate}</time>
          </div>

          {/* Title */}
          <h1 className="font-serif text-[2.8rem] leading-[1.04] tracking-[-0.01em] text-foreground sm:text-[3.4rem]">
            {note.title}
          </h1>

          {/* Excerpt / lead */}
          {note.excerpt && (
            <p className="mt-5 text-[1.05rem] leading-[1.75] text-muted-foreground sm:text-[1.1rem]">
              {note.excerpt}
            </p>
          )}

          {/* Decorative rule */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#e4d8cc] dark:bg-white/10" />
            <span className="text-[0.7rem] tracking-[0.2em] text-[#c9bfb3] dark:text-white/20">✦</span>
            <div className="h-px flex-1 bg-[#e4d8cc] dark:bg-white/10" />
          </div>
        </div>
      </div>

      {/* ── Prose body ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-4 pb-28 pt-10 sm:px-6">
        <div
          className="note-prose prose max-w-none"
          dangerouslySetInnerHTML={{__html: note.html}}
        />
      </div>
    </article>
  );
}

/** @typedef {import('./+types/notes.$slug').Route} Route */