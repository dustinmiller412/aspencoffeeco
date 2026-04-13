import {redirect, useLoaderData} from 'react-router';
import {NavLink} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
import {ArrowRight} from 'lucide-react';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {formatProductPrice} from '~/lib/price';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `${data?.collection.title ?? ''} | Aspen Coffee Co`}];
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
 * Load critical data
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 12,
  });

  if (!handle) {
    throw redirect('/collections');
  }

  const [{collection}, {collections}] = await Promise.all([
    storefront.query(COLLECTION_QUERY, {
      variables: {handle, ...paginationVariables},
    }),
    storefront.query(COLLECTIONS_QUERY),
  ]);

  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {
      status: 404,
    });
  }

  redirectIfHandleIsLocalized(request, {handle, data: collection});

  return {
    collection,
    collections,
  };
}

/**
 * Load deferred data
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  return {};
}

const SHOP_FILTER_TITLES = [
  'Coffee',
  'Blends',
  'Single Origin',
  'Subscriptions',
  'Gear',
  'Merch',
];

const COLLECTION_HEADER_COPY = {
  coffee:
    'Everything we roast, all in one place. From everyday blends to rotating single origins and subscriptions, this is the full lineup. Whether you’re just getting into specialty coffee or already deep into it, you’ll find something here that’s easy to brew and worth coming back to.',
  blends:
    'Built for consistency and balance. Our blends are designed to be approachable, reliable, and easy to brew no matter your setup. Whether it’s your first step into specialty coffee or your daily go-to, these are the coffees you don’t have to overthink.',
  'single-origin':
    'Coffees with a clear sense of place. Each single origin highlights the character of where it was grown and how it was processed. We keep the approach simple so you can focus on what makes each one unique without needing a perfect setup to enjoy it.',
  subscriptions:
    'Fresh coffee, on your schedule. Our subscriptions are the easiest way to stay stocked and keep things interesting. Choose what fits your routine and we’ll handle the rest, with coffees roasted to order and sent at their peak.',
  gear:
    'Reliable brewing tools to help you get the most out of every bag.',
  merch:
    'Aspen goods for home, cafe days, and coffee runs.',
};

export default function Collection() {
  const {collection, collections} = useLoaderData();
  const headerCopy =
    COLLECTION_HEADER_COPY[collection.handle] ||
    collection.description ||
    '';

  // Resolve requested filter titles to actual Shopify collection handles.
  const filters = SHOP_FILTER_TITLES.map((title) => {
    const byExactTitle = collections?.nodes?.find(
      (node) => node.title.toLowerCase() === title.toLowerCase(),
    );

    return {
      label: title,
      handle:
        byExactTitle?.handle ||
        title
          .toLowerCase()
          .replace(/&/g, 'and')
          .replace(/\s+/g, '-'),
    };
  });

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8}}
          className="mb-16"
        >
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-medium tracking-tight mb-6">
            Shop
          </h1>
          <p className="text-muted-foreground max-w-2xl leading-relaxed">
            {headerCopy}
          </p>
        </motion.div>

        {/* Collection Filters */}
        <div className="mb-12 flex flex-wrap items-center gap-2.5">
          {filters.map((filter) => {
            const isActive = filter.handle === collection.handle;

            return (
              <NavLink
                key={filter.label}
                to={`/collections/${filter.handle}`}
                className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] uppercase tracking-[0.14em] whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-[#ddcfbf] bg-[#f8f2ea] text-muted-foreground hover:text-foreground dark:border-white/20 dark:bg-white/5 dark:hover:border-white/35'
                }`}
              >
                {filter.label}
              </NavLink>
            );
          })}
        </div>

        {/* Products Grid */}
        {collection.products?.nodes?.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-6">
            {collection.products.nodes.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: i * 0.08, duration: 0.6}}
              >
                <NavLink
                  to={`/products/${product.handle}`}
                  className="group block cursor-pointer"
                >
                  <div className="aspect-[3/4] overflow-hidden mb-6 bg-secondary">
                    {product.featuredImage && (
                      <img
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif text-lg font-medium">{product.title}</h3>
                      <span className="text-sm font-medium">
                        ${formatProductPrice(product.priceRange?.minVariantPrice?.amount || '0')}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-accent mt-2 group-hover:text-foreground transition-colors">
                      View Details
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </NavLink>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No products found in this collection.</p>
          </div>
        )}
      </div>
      
      <Analytics.CollectionView
        data={{
          collection: {
            id: collection.id,
            handle: collection.handle,
          },
        }}
      />
    </div>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
  }
`;

const COLLECTION_QUERY = `#graphql
  ${PRODUCT_ITEM_FRAGMENT}
  query Collection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      products(
        first: $first,
        last: $last,
        before: $startCursor,
        after: $endCursor,
        sortKey: CREATED,
        reverse: true
      ) {
        nodes {
          ...ProductItem
        }
        pageInfo {
          hasPreviousPage
          hasNextPage
          endCursor
          startCursor
        }
      }
    }
  }
`;

const COLLECTIONS_QUERY = `#graphql
  query Collections {
    collections(first: 10) {
      nodes {
        id
        title
        handle
      }
    }
  }
`;

/** @typedef {import('./+types/collections.$handle').Route} Route */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
