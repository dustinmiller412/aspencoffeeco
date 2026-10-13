import {Link, useLoaderData, useSearchParams} from 'react-router';
import {motion} from 'framer-motion';
import {NoteCard} from '~/components/NoteCard';
import {PageHeader} from '~/components/PageHeader';
import {getAllNotesMeta} from '~/lib/notes.server';
import {NOTE_TAGS} from '~/lib/note-tags';

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
  const [searchParams] = useSearchParams();

  const selectedTags = searchParams
    .getAll('tag')
    .map((tag) => tag.trim())
    .filter((tag) => NOTE_TAGS.includes(tag));

  const filteredNotes = selectedTags.length
    ? notes.filter((note) => note.tags?.some((tag) => selectedTags.includes(tag)))
    : notes;

  /** @param {string} tag */
  function getTagFilterHref(tag) {
    const nextParams = new URLSearchParams(searchParams);
    const current = new Set(selectedTags);

    if (current.has(tag)) {
      current.delete(tag);
    } else {
      current.add(tag);
    }

    nextParams.delete('tag');
    NOTE_TAGS.forEach((allowedTag) => {
      if (current.has(allowedTag)) {
        nextParams.append('tag', allowedTag);
      }
    });

    const query = nextParams.toString();
    return query ? `?${query}` : '/fieldnotes';
  }

  return (
    <>
      <PageHeader eyebrow="Learn & discover" title="Field notes" dark>
        Brewing guides, origin stories, and everything worth knowing about what&apos;s in
        your cup.
      </PageHeader>

      <section className="px-6 py-14 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap items-center gap-2.5">
            {NOTE_TAGS.map((tag) => (
              <Link
                key={tag}
                to={getTagFilterHref(tag)}
                prefetch="intent"
                className={`pill ${selectedTags.includes(tag) ? 'pill-active' : ''}`}
              >
                {tag}
              </Link>
            ))}
            {selectedTags.length ? (
              <Link to="/fieldnotes" prefetch="intent" className="eyebrow ml-2 underline underline-offset-4">
                Clear
              </Link>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.slug}
                className="h-full"
                initial={{opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: i * 0.06, duration: 0.55}}
              >
                <NoteCard note={note} />
              </motion.div>
            ))}
          </div>

          {!filteredNotes.length ? (
            <p className="mt-10 text-sm">No field notes match the selected tags.</p>
          ) : null}
        </div>
      </section>
    </>
  );
}

/** @typedef {import('./+types/notes._index').Route} Route */
