import {useLoaderData} from 'react-router';
import {seoMeta} from '~/lib/meta';
import HeroSection from '~/components/home/HeroSection';
import {ContourDivider} from '~/components/ContourDivider';
import FeaturedProducts from '~/components/home/FeaturedProducts';
import PhilosophySection from '~/components/home/PhilosophySection';
import TestimonialBanner from '~/components/home/TestimonialBanner';
import BlogPreview from '~/components/home/BlogPreview';
import {MockShopNotice} from '~/components/MockShopNotice';
import {getAllNotesMeta} from '~/lib/notes.server';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({matches}) =>
  seoMeta({fullTitle: 'Aspen Coffee Co | Small-batch coffee roasted in Pittsburgh', matches});

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
          featuredHandle: 'featured',
          blendsHandle: 'blends',
          singleOriginHandle: 'single-origin',
          subscriptionHandle: 'roasters-choice-subscription',
          first: 8,
        },
      }),
    ]);

    // Lineup comes from the "featured" collection (in its admin sort order). Until that
    // collection exists or while it's empty, fall back to the newest blends + single origins.
    const featuredNodes = featuredCollections?.featured?.products?.nodes || [];
    const blendedNodes = featuredCollections?.blends?.products?.nodes || [];
    const singleOriginNodes = featuredCollections?.singleOrigin?.products?.nodes || [];

    const mergedNodes = [...blendedNodes, ...singleOriginNodes]
      .filter(Boolean)
      .filter(
        (product, index, allProducts) =>
          allProducts.findIndex((item) => item.id === product.id) === index,
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const lineup = (featuredNodes.length ? featuredNodes : mergedNodes).slice(0, 8);

    return {
      isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
      products: {nodes: lineup},
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

// Temporarily hidden. Flip to true to bring the Field Notes preview back.
const SHOW_FIELD_NOTES = false;

export default function Homepage() {
  const data = useLoaderData();

  return (
    <div className="bg-paper">
      {!data.isShopLinked && <MockShopNotice />}
      <HeroSection />
      <ContourDivider fillAbove="fill-ink" />
      <FeaturedProducts products={data.products} />
      <TestimonialBanner image={data.subscriptionImage} />
      <PhilosophySection />
      {SHOW_FIELD_NOTES && <BlogPreview notes={data.notes} />}
    </div>
  );
}

const FEATURED_PRODUCTS_QUERY = `#graphql
  fragment HomeProduct on Product {
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
  query FeaturedProducts(
    $featuredHandle: String!
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
    featured: collection(handle: $featuredHandle) {
      products(first: $first, sortKey: COLLECTION_DEFAULT) {
        nodes {
          ...HomeProduct
        }
      }
    }
    blends: collection(handle: $blendsHandle) {
      products(first: $first, sortKey: CREATED, reverse: true) {
        nodes {
          ...HomeProduct
        }
      }
    }
    singleOrigin: collection(handle: $singleOriginHandle) {
      products(first: $first, sortKey: CREATED, reverse: true) {
        nodes {
          ...HomeProduct
        }
      }
    }
  }
`;
