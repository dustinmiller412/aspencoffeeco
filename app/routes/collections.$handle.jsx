import {redirect, useLoaderData} from 'react-router';
import {NavLink} from 'react-router';
import {getPaginationVariables, Analytics} from '@shopify/hydrogen';
import {motion} from 'framer-motion';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductItem} from '~/components/ProductItem';
import {PageHeader} from '~/components/PageHeader';

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
    <div>
      <PageHeader eyebrow="Shop" title={collection.title} dark>
        {headerCopy}
      </PageHeader>

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        {/* Collection Filters */}
        <div className="mb-12 flex flex-wrap items-center gap-2.5">
          {filters.map((filter) => (
            <NavLink
              key={filter.label}
              to={`/collections/${filter.handle}`}
              className={`pill whitespace-nowrap ${
                filter.handle === collection.handle ? 'pill-active' : ''
              }`}
            >
              {filter.label}
            </NavLink>
          ))}
        </div>

        {/* Products Grid */}
        {collection.products?.nodes?.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {collection.products.nodes.map((product, i) => (
              <motion.div
                key={product.id}
                className="h-full"
                initial={{opacity: 0, y: 30}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: i * 0.08, duration: 0.6}}
              >
                <ProductItem product={product} loading={i < 6 ? 'eager' : 'lazy'} />
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
