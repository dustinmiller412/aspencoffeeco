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
    const [featuredCollections] = await Promise.all([
      context.storefront.query(FEATURED_PRODUCTS_QUERY, {
        variables: {
          blendsHandle: 'blends',
          singleOriginHandle: 'single-origin',
          first: 8,
        },
      }),
    ]);

    const blendedNodes = featuredCollections?.blends?.products?.nodes || [];
    const singleOriginNodes = featuredCollections?.singleOrigin?.products?.nodes || [];

    const mergedNodes = [...blendedNodes, ...singleOriginNodes]
      .filter(Boolean)
      .filter(
        (product, index, allProducts) =>
          allProducts.findIndex((item) => item.id === product.id) === index,
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4);

    return {
      isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
      products: {nodes: mergedNodes},
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
  query FeaturedProducts(
    $blendsHandle: String!
    $singleOriginHandle: String!
    $first: Int!
  ) {
    blends: collection(handle: $blendsHandle) {
      products(first: $first, sortKey: CREATED, reverse: true) {
        nodes {
          id
          title
          handle
          createdAt
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
    singleOrigin: collection(handle: $singleOriginHandle) {
      products(first: $first, sortKey: CREATED, reverse: true) {
        nodes {
          id
          title
          handle
          createdAt
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
