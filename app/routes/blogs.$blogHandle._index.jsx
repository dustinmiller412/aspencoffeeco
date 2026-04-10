import {Link, useLoaderData} from 'react-router';
import {ArrowLeft} from 'lucide-react';
import {getNoteBySlug, renderMarkdown} from '~/lib/notes.server';

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
  const slug = params.blogHandle;

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
  /** @type {{note: {title: string; date: string; category: string; coverImage: string; excerpt: string; html: string}}} */
  const {note} = useLoaderData();

  return (
    <article className="px-6 pb-24 pt-28">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/blogs"
          className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to notes
        </Link>

        <div className="mb-8 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
          <span>{note.category}</span>
          <span aria-hidden="true">•</span>
          <time dateTime={note.date}>{new Date(note.date).toLocaleDateString()}</time>
        </div>

        <h1 className="font-serif text-5xl leading-[0.98] tracking-[0.01em] text-foreground">
          {note.title}
        </h1>

        {note.excerpt ? <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{note.excerpt}</p> : null}

        {note.coverImage ? (
          <div className="mt-10 overflow-hidden rounded-[1.3rem] border border-[#e7ddd1] dark:border-white/10">
            <img src={note.coverImage} alt={note.title} className="h-auto w-full object-cover" loading="eager" />
          </div>
        ) : null}

        <div
          className="prose prose-neutral mt-12 max-w-none text-[1.02rem] leading-8 dark:prose-invert"
          dangerouslySetInnerHTML={{__html: note.html}}
        />
      </div>
    </article>
  );
}

/** @typedef {import('./+types/blogs.$blogHandle._index').Route} Route */
