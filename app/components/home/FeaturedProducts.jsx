import {motion} from 'framer-motion';
import {NavLink} from 'react-router';
import {ArrowRight} from 'lucide-react';
import {ProductItem} from '~/components/ProductItem';

export default function FeaturedProducts({products}) {
  const productsToShow = products?.nodes?.slice(0, 8) ?? [];

  return (
    <section className="bg-paper px-6 pb-14 pt-10 md:pb-16 md:pt-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-4">Current lineup</p>
            <h2 className="display text-5xl lg:text-6xl">Fresh off the roaster</h2>
          </div>
          <NavLink to="/collections/coffee" className="btn-outline self-start md:self-auto">
            Shop all coffee
            <ArrowRight className="h-4 w-4" />
          </NavLink>
        </div>

        {productsToShow.length > 0 && (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
            {productsToShow.map((product, i) => (
              <motion.div
                key={product.id}
                className="h-full"
                initial={{opacity: 0, y: 40}}
                whileInView={{opacity: 1, y: 0}}
                viewport={{once: true, margin: '-50px'}}
                transition={{delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1]}}
              >
                <ProductItem product={product} loading="eager" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
