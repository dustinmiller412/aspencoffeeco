import {useLoaderData} from 'react-router';
import HeroSection from '~/components/home/HeroSection';
import MarqueeStrip from '~/components/home/MarqueeStrip';
import FeaturedProducts from '~/components/home/FeaturedProducts';
import PhilosophySection from '~/components/home/PhilosophySection';
import TestimonialBanner from '~/components/home/TestimonialBanner';
import BlogPreview from '~/components/home/BlogPreview';
import NewsletterSection from '~/components/home/NewsletterSection';
import {MockShopNotice} from '~/components/MockShopNotice';
import {getAllNotesMeta} from '~/lib/notes.server';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Aspen Coffee Co | Home'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load critical data for above the fold
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  try {
    const notes = getAllNotesMeta().slice(0, 3);
    const [{collection}] = await Promise.all([
      context.storefront.query(FEATURED_PRODUCTS_QUERY, {
        variables: {
          handle: 'coffee',
          first: 4,
        },
      }),
    ]);

    return {
      isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
      products: collection?.products ?? null,
      notes,
    };
  } catch (error) {
    console.error('Error loading critical data:', error);
    return {
      isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
      products: null,
      notes: getAllNotesMeta().slice(0, 3),
    };
  }
}

/**
 * Load deferred data for below the fold
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Homepage() {
  const data = useLoaderData();

  return (
    <div className="bg-[linear-gradient(180deg,#fffdfa_0%,#fdfaf5_38%,#fffdf9_72%,#ffffff_100%)] dark:bg-[linear-gradient(180deg,#151311_0%,#191613_40%,#12100f_100%)]">
      {!data.isShopLinked && <MockShopNotice />}
      <HeroSection />
      <MarqueeStrip />
      <FeaturedProducts products={data.products} />
      <TestimonialBanner />
      <PhilosophySection />
      <BlogPreview notes={data.notes} />
      <NewsletterSection />
    </div>
  );
}

const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        nodes {
          id
          title
          handle
          featuredImage {
            url
            altText
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          variants(first: 1) {
            nodes {
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;
