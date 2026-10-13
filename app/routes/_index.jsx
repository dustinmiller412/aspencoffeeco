import {useLoaderData} from 'react-router';
import HeroSection from '~/components/home/HeroSection';
import BrandBand from '~/components/home/BrandBand';
import FeaturedProducts from '~/components/home/FeaturedProducts';
import PhilosophySection from '~/components/home/PhilosophySection';
import TestimonialBanner from '~/components/home/TestimonialBanner';
import BlogPreview from '~/components/home/BlogPreview';
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
          subscriptionHandle: 'roasters-choice-subscription',
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
      subscriptionImage: featuredCollections?.subscriptionFeature?.featuredImage ?? null,
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
    <div className="bg-paper">
      {!data.isShopLinked && <MockShopNotice />}
      <HeroSection />
      <BrandBand />
      <FeaturedProducts products={data.products} />
      <TestimonialBanner image={data.subscriptionImage} />
      <PhilosophySection />
      <BlogPreview notes={data.notes} />
    </div>
  );
}

const FEATURED_PRODUCTS_QUERY = `#graphql
  query FeaturedProducts(
    $blendsHandle: String!
    $singleOriginHandle: String!
    $subscriptionHandle: String!
    $first: Int!
  ) {
    subscriptionFeature: product(handle: $subscriptionHandle) {
      featuredImage {
        url
        altText
        width
        height
      }
    }
    blends: collection(handle: $blendsHandle) {
      products(first: $first, sortKey: CREATED, reverse: true) {
        nodes {
          id
          title
          handle
          createdAt
          productType
          availableForSale
          images(first: 2) {
            nodes {
              id
              altText
              url
              width
              height
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
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
          productType
          availableForSale
          images(first: 2) {
            nodes {
              id
              altText
              url
              width
              height
            }
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
    }
  }
`;
