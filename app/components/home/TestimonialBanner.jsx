import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {Image} from '@shopify/hydrogen';
import {ContourDivider} from '~/components/ContourDivider';

/**
 * @param {{image?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null}}
 */
export default function TestimonialBanner({image}) {
  return (
    <section className="p-0">
      <ContourDivider fillBelow="fill-pop-1" />
      <div className="bg-pop-1 py-20 md:py-28">
        <motion.div
          initial={{opacity: 0, y: 18}}
          whileInView={{opacity: 1, y: 0}}
          viewport={{once: true}}
          transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}
          className="mx-auto grid max-w-7xl items-center gap-14 px-6 md:grid-cols-2"
        >
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-full bg-ink" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full border-2 border-ink bg-paper-2">
              {image ? (
                <Image
                  data={image}
                  alt={image.altText || "Roaster's Choice coffee subscription"}
                  className="h-full w-full object-cover"
                  sizes="(min-width: 48em) 28rem, 100vw"
                  loading="lazy"
                />
              ) : (
                <img
                  src="/images/blends.png"
                  alt="Coffee subscription"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-4">Fresh coffee. On your schedule.</p>
            <h2 className="text-5xl md:text-6xl">Let us do the hard work for you.</h2>
            <p className="mt-6 max-w-[46ch] text-lg">
              Subscribe for free shipping, first access to new drops, and a reliable coffee
              routine without the guesswork.
            </p>
            <NavLink to="/collections/subscriptions" className="btn-ink mt-8">
              Subscribe to coffee
              <ArrowRight className="h-4 w-4" />
            </NavLink>
          </div>
        </motion.div>
      </div>
      <ContourDivider className="bg-ink text-pop-1" fillAbove="fill-pop-1" />
    </section>
  );
}
