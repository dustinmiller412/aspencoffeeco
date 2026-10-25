import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {NoteCard} from '~/components/NoteCard';

/**
 * @param {{notes?: Array<{title: string; slug: string; category: string; coverImage: string; excerpt: string; date: string}>}} props
 */
export default function BlogPreview({notes = []}) {
  const previewNotes = notes.slice(0, 3);

  return (
    <section className="bg-paper px-6 pb-4 pt-14 md:pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4">Learn & discover</p>
            <h2 className="text-5xl md:text-7xl">Field notes</h2>
          </div>
          <NavLink to="/fieldnotes" className="btn-outline self-start md:self-auto">
            All field notes
            <ArrowRight className="h-4 w-4" />
          </NavLink>
        </div>

        {previewNotes.length ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {previewNotes.map((note, i) => (
              <motion.div
                key={note.slug}
                className="h-full"
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: i * 0.1, duration: 0.7}}
              >
                <NoteCard note={note} />
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm">No notes yet.</p>
        )}
      </div>
    </section>
  );
}
