import {Link, useLoaderData} from 'react-router';
import {motion} from 'framer-motion';
import {ArrowRight} from 'lucide-react';
import {getAllNotesMeta} from '~/lib/notes.server';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Aspen Coffee Co | Field Notes'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader() {
  return {notes: getAllNotesMeta()};
}

export default function NotesIndex() {
  /** @type {{notes: Array<{title: string; date: string; slug: string; category: string; coverImage: string; excerpt: string; tags: string[]}>}} */
  const {notes} = useLoaderData();

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14">
          <p className="mb-4 text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Field Notes
          </p>
          <h1 className="font-serif text-5xl leading-[0.98] tracking-[0.01em] text-foreground">
            Brew Better
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {notes.map((note, i) => (
            <motion.article
              key={note.slug}
              initial={{opacity: 0, y: 24}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: i * 0.06, duration: 0.55}}
              className="rounded-[1.6rem] border border-[#e7ddd1] bg-white/80 p-4 shadow-[0_10px_30px_-25px_rgba(45,32,20,0.4)] dark:border-white/10 dark:bg-white/5"
            >
              <Link
                to={`/blogs/${note.slug}`}
                prefetch="intent"
                className="group block cursor-pointer rounded-[1.1rem] text-inherit no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70"
              >
                {note.coverImage ? (
                  <div className="mb-5 aspect-[16/10] overflow-hidden rounded-[1.1rem] bg-[#f5eee6] dark:bg-white/10">
                    <img
                      src={note.coverImage}
                      alt={note.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <div className="mb-2 flex items-center justify-between gap-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  <span>{note.category}</span>
                  <time dateTime={note.date}>{new Date(note.date).toLocaleDateString()}</time>
                </div>

                <h2 className="font-serif text-2xl leading-[1.06] text-foreground no-underline">
                  {note.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground no-underline">
                  {note.excerpt}
                </p>

                {note.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <span
                        key={`${note.slug}-${tag}`}
                        className="rounded-full border border-[#e5d8ca] bg-[#fbf7f2] px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground dark:border-white/15 dark:bg-white/5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <span className="mt-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-foreground/80 no-underline">
                  <span className="underline-offset-4 decoration-1 group-hover:underline">
                    Read note
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** @typedef {import('./+types/blogs._index').Route} Route */
