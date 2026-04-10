import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';

/**
 * @param {{notes?: Array<{title: string; slug: string; category: string; coverImage: string; excerpt: string; date: string}>}} props
 */
export default function BlogPreview({notes = []}) {
  const previewNotes = notes.slice(0, 3);

  return (
    <section className="px-6 py-32 bg-[linear-gradient(180deg,rgba(248,243,237,0.55)_0%,rgba(252,247,241,0.78)_42%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0.018)_45%,transparent_100%)]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground mb-4">
              Learn & Discover
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium leading-[0.98] tracking-[0.01em]">
              Field Notes
            </h2>
          </div>
          <NavLink
            to="/fieldnotes"
            className="group inline-flex items-center gap-2 text-sm tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            All Field Notes
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </div>

        {previewNotes.length ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
            {previewNotes.map((note, i) => (
              <motion.div
                key={note.slug}
                initial={{opacity: 0, y: 30}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true}}
                transition={{delay: i * 0.1, duration: 0.7}}
              >
                <NavLink
                  to={`/fieldnotes/${note.slug}`}
                  className="group block cursor-pointer rounded-[1.75rem] border border-[#e7ddd1] bg-white/70 p-4 text-inherit no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 dark:border-white/10 dark:bg-white/5"
                >
                  {note.coverImage ? (
                    <div className="aspect-[16/10] overflow-hidden rounded-[1.2rem] bg-[#f6efe7] mb-6 dark:bg-white/10">
                      <img
                        src={note.coverImage}
                        alt={note.title}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out motion-reduce:transition-none group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs tracking-[0.16em] uppercase text-muted-foreground">
                    <span>{note.category}</span>
                    <time dateTime={note.date}>{new Date(note.date).toLocaleDateString()}</time>
                  </div>
                  <h3 className="font-serif text-xl leading-[1.1] font-medium mt-2 mb-2 no-underline text-foreground">
                    {note.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed no-underline">
                    {note.excerpt}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted-foreground dark:text-foreground/80 no-underline">
                    <span className="underline-offset-4 decoration-1 group-hover:underline">
                      Read note
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </NavLink>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No notes yet.</p>
        )}
      </div>
    </section>
  );
}
