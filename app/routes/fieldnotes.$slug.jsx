import {Link, useLoaderData} from 'react-router';
import {seoMeta} from '~/lib/meta';
import {ArrowLeft} from 'lucide-react';
import {getNoteBySlug, renderMarkdown} from '~/lib/notes.server';
import '~/styles/note-prose.css';
/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data, matches}) =>
  seoMeta({
    title: data?.note.title ?? 'Field Notes',
    description: data?.note.excerpt,
    image: data?.note.coverImage,
    matches,
  });

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
    <article>
      <header className="border-b-2 border-ink bg-pop-2 px-4 pb-32 pt-12 sm:px-6 md:pt-16">
        <div className="mx-auto max-w-3xl">
          <Link to="/fieldnotes" className="pill mb-10 gap-2 no-underline hover:no-underline">
            <ArrowLeft className="h-3.5 w-3.5" />
            Field notes
          </Link>
          <div className="eyebrow mb-5 flex flex-wrap items-center gap-2">
            {note.category && (
              <>
                <span>{note.category}</span>
                <span aria-hidden="true">✺</span>
              </>
            )}
            <time dateTime={note.date}>{formattedDate}</time>
          </div>
          <h1 className="m-0 text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95]">{note.title}</h1>
          {note.excerpt && <p className="mt-6 max-w-2xl text-lg leading-relaxed">{note.excerpt}</p>}
          {note.tags?.length ? (
            <div className="mt-6 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span key={tag} className="eyebrow border-2 border-ink bg-paper-2 px-2 py-0.5 text-[0.6rem]">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {note.coverImage ? (
        <div className="mx-auto -mt-24 max-w-3xl px-4 sm:px-6">
          <img
            src={note.coverImage}
            alt={note.title}
            className="block-card aspect-[16/9] w-full object-cover p-0 shadow-block-lg"
            loading="eager"
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-2xl px-4 pb-10 pt-14 sm:px-6">
        <div
          className="note-prose prose max-w-none"
          dangerouslySetInnerHTML={{__html: note.html}}
        />
      </div>
    </article>
  );
}

/** @typedef {import('./+types/notes.$slug').Route} Route */
