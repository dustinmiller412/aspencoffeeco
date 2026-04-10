import {motion} from 'framer-motion';
import {NavLink, Await} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {Suspense} from 'react';
import {Image} from '@shopify/hydrogen';
import {formatProductPrice} from '~/lib/price';

const cardVariants = {
  hidden: {opacity: 0, y: 40},
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {delay: i * 0.15, duration: 0.8, ease: [0.22, 1, 0.36, 1]},
  }),
};

export default function FeaturedProducts({products}) {
  return (
    <section className="px-6 py-32">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-xs tracking-[0.24em] uppercase text-muted-foreground mb-4">
              Current Lineup
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-medium leading-[0.98] tracking-[0.01em]">
              Featured Roasts
            </h2>
          </div>
          <NavLink
            to="/collections/coffee"
            className="group inline-flex items-center gap-2 text-sm tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </NavLink>
        </div>

        <Suspense fallback={<div>Loading products...</div>}>
          <Await resolve={products}>
            {(resolvedProducts) => {
              if (!resolvedProducts?.nodes?.length) return null;
              const productsToShow = resolvedProducts.nodes.slice(0, 4);

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 md:gap-6">
                  {productsToShow.map((product, i) => (
                    <motion.div
                      key={product.id}
                      custom={i}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{once: true, margin: '-50px'}}
                      variants={cardVariants}
                    >
                      <NavLink
                        to={`/products/${product.handle}`}
                        className="group block rounded-[2rem] border border-[#e7ddd1] bg-white/72 p-4 text-inherit no-underline hover:no-underline shadow-[0_18px_50px_rgba(91,64,40,0.04)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
                      >
                        <div className="aspect-[3/4] overflow-hidden rounded-[1.4rem] mb-6 bg-[#f5eee6] dark:bg-white/10">
                          {product.featuredImage && (
                            <Image
                              data={product.featuredImage}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                            />
                          )}
                        </div>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="mb-1 font-serif text-[1.4rem] leading-[1.05] font-medium text-foreground">
                              {product.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {product.variants?.nodes?.[0]?.selectedOptions
                                ?.map((opt) => opt.value)
                                .join(' · ') || 'Single Origin'}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-foreground">
                            {product.priceRange?.minVariantPrice?.amount
                              ? `$${formatProductPrice(product.priceRange.minVariantPrice.amount)}`
                              : 'Contact for price'}
                          </span>
                        </div>
                      </NavLink>
                    </motion.div>
                  ))}
                </div>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </section>
  );
}
