import { useLoaderData } from 'react-router';
import { NavLink } from 'react-router';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  getSelectedProductOptions,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProductForm } from '~/components/ProductForm';
import { AddToCartButton } from '~/components/AddToCartButton';
import { redirectIfHandleIsLocalized } from '~/lib/redirect';
import { useAside } from '~/components/Aside';
import { formatProductPrice } from '~/lib/price';
import ProductStorytelling from '~/components/product/ProductStorytelling';

const SHOP_COLLECTION_PRIORITY = [
  'coffee',
  'blends',
  'single-origin',
  'subscriptions',
  'gear',
  'merch',
];

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({ data }) => {
  return [
    { title: `${data?.product.title ?? ''} | Aspen Coffee Co` },
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);

  return { ...deferredData, ...criticalData };
}

/**
 * Load critical data
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({ context, params, request }) {
  const { handle } = params;
  const { storefront } = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{ product }] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: { handle, selectedOptions: getSelectedProductOptions(request) },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, { status: 404 });
  }

  redirectIfHandleIsLocalized(request, { handle, data: product });

  return { product };
}

/**
 * Load deferred data
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({ context, params }) {
  return {};
}

export default function Product() {
  const { product } = useLoaderData();
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSellingPlanId, setSelectedSellingPlanId] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { open } = useAside();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const sellingPlans = useMemo(() => {
    const groups = product?.sellingPlanGroups?.nodes || [];
    return groups.flatMap((group) =>
      (group.sellingPlans?.nodes || []).map((plan) => ({
        id: plan.id,
        name: plan.name,
      })),
    );
  }, [product]);

  const productImages = useMemo(() => product?.images?.nodes || [], [product?.images?.nodes]);
  const activeImage = productImages[currentImageIndex] || selectedVariant?.image || null;
  const hasMultipleImages = productImages.length > 1;

  // Short-description metafield wins; otherwise show the full Shopify description.
  const shortDescription = product?.shortDescription?.value?.trim();

  const isSubscriptionProduct = useMemo(() => {
    return (product?.collections?.nodes || []).some(
      (collection) => collection.handle === 'subscriptions',
    );
  }, [product?.collections?.nodes]);

  const isCoffeeProduct = useMemo(() => {
    return (product?.collections?.nodes || []).some(
      (collection) => collection.handle === 'coffee',
    );
  }, [product?.collections?.nodes]);

  const backToShopPath = useMemo(() => {
    const collectionHandles = (product?.collections?.nodes || []).map(
      (collection) => collection.handle,
    );

    const prioritizedHandle = SHOP_COLLECTION_PRIORITY.find((handle) =>
      collectionHandles.includes(handle),
    );

    if (prioritizedHandle) {
      return `/collections/${prioritizedHandle}`;
    }

    const firstSpecificHandle = collectionHandles.find(
      (handle) => handle && handle !== 'all',
    );

    return firstSpecificHandle ? `/collections/${firstSpecificHandle}` : '/collections';
  }, [product?.collections?.nodes]);

  useEffect(() => {
    if (!sellingPlans.length && selectedSellingPlanId) {
      setSelectedSellingPlanId('');
    }
  }, [selectedSellingPlanId, sellingPlans]);

  useEffect(() => {
    if (isSubscriptionProduct && sellingPlans.length && !selectedSellingPlanId) {
      setSelectedSellingPlanId(sellingPlans[0].id);
    }
  }, [isSubscriptionProduct, selectedSellingPlanId, sellingPlans]);

  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        setIsImageModalOpen(false);
      }
    };

    if (isImageModalOpen) {
      window.addEventListener('keydown', handleKeydown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isImageModalOpen]);

  useEffect(() => {
    if (!productImages.length) {
      setCurrentImageIndex(0);
      return;
    }

    const selectedImageId = selectedVariant?.image?.id;
    if (!selectedImageId) return;

    const matchingImageIndex = productImages.findIndex(
      (image) => image.id === selectedImageId,
    );

    if (matchingImageIndex >= 0) {
      setCurrentImageIndex(matchingImageIndex);
    }
  }, [productImages, selectedVariant?.image?.id]);

  const effectiveSellingPlanId =
    isSubscriptionProduct && sellingPlans.length
      ? selectedSellingPlanId || sellingPlans[0].id
      : selectedSellingPlanId;

  const handleAddToCart = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const goToPreviousImage = () => {
    if (!hasMultipleImages) return;

    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1,
    );
  };

  const goToNextImage = () => {
    if (!hasMultipleImages) return;

    setCurrentImageIndex((prevIndex) =>
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const squareButton =
    'inline-flex h-11 w-11 items-center justify-center border-2 border-ink bg-paper-2 text-ink transition-colors hover:bg-cta';

  return (
    <div className="px-6 pb-8 pt-8 md:pt-12">
      <div className="mx-auto max-w-7xl">
        <NavLink to={backToShopPath} className="pill mb-10 gap-2">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to shop
        </NavLink>

        <div className="mb-24 grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <div className="block-card relative aspect-square overflow-hidden shadow-block-lg">
              {activeImage ? (
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(true)}
                  className="h-full w-full cursor-zoom-in"
                  aria-label="Open larger product image"
                >
                  <img
                    src={activeImage.url}
                    alt={activeImage.altText || product.title}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : null}

              {hasMultipleImages ? (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button type="button" onClick={goToPreviousImage} className={squareButton} aria-label="Previous product image">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={goToNextImage} className={squareButton} aria-label="Next product image">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              ) : null}
            </div>

            {hasMultipleImages ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={image.id || image.url || index}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-16 w-16 overflow-hidden border-2 border-ink transition-[transform,box-shadow] ${
                      index === currentImageIndex ? '-translate-x-0.5 -translate-y-0.5 shadow-block' : 'opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`Go to product image ${index + 1}`}
                  >
                    <img src={image.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-w-xl flex-col"
          >
            <p className="eyebrow mb-4">{product.vendor || 'Aspen Coffee Co'}</p>

            <h1 className="m-0 mb-6 text-[clamp(2.5rem,5vw,4.25rem)] leading-[0.95]">{product.title}</h1>

            {shortDescription ? (
              <p className="mb-8 max-w-lg whitespace-pre-line text-lg leading-relaxed">{shortDescription}</p>
            ) : product.descriptionHtml ? (
              <div
                className="mb-8 max-w-lg space-y-4 text-lg leading-relaxed [&_a]:underline [&_a]:decoration-cta [&_a]:decoration-[3px] [&_a]:underline-offset-4 [&_li]:mb-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_strong]:font-bold [&_ul]:list-disc [&_ul]:pl-6"
                dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
              />
            ) : null}

            <div className="flex flex-col gap-7">
              <div className="flex items-center justify-between gap-6 border-y-2 border-ink py-4">
                {selectedVariant?.price && (
                  <span className="font-display text-4xl">
                    ${formatProductPrice(selectedVariant.price.amount)}
                  </span>
                )}

                <div className="flex items-center border-2 border-ink bg-paper-2">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-12 w-11 items-center justify-center text-lg font-bold transition-colors hover:bg-pop-1"
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <span className="w-10 border-x-2 border-ink text-center font-display leading-[3rem]">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-12 w-11 items-center justify-center text-lg font-bold transition-colors hover:bg-pop-1"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <Suspense fallback={null}>
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                  hideAddToCartButton
                />
              </Suspense>

              {isCoffeeProduct ? (
                <p className="-mt-2 text-sm">
                  Not sure what grind size to choose?{' '}
                  <NavLink
                    to="/grind-size-guide"
                    className="font-bold underline decoration-cta decoration-[3px] underline-offset-4"
                  >
                    Check out our grind size guide
                  </NavLink>
                </p>
              ) : null}

              {sellingPlans.length ? (
                <div>
                  <p className="eyebrow mb-3">Purchase option</p>
                  <div className="flex flex-wrap gap-2.5">
                    {!isSubscriptionProduct ? (
                      <button
                        type="button"
                        onClick={() => setSelectedSellingPlanId('')}
                        className={`pill ${!selectedSellingPlanId ? 'pill-active' : ''}`}
                      >
                        One-time purchase
                      </button>
                    ) : null}

                    {sellingPlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedSellingPlanId(plan.id)}
                        className={`pill ${effectiveSellingPlanId === plan.id ? 'pill-active' : ''}`}
                      >
                        {plan.name}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <AddToCartButton
                disabled={!selectedVariant || !selectedVariant.availableForSale}
                lines={
                  selectedVariant
                    ? [
                      {
                        merchandiseId: selectedVariant.id,
                        quantity,
                        sellingPlanId: effectiveSellingPlanId || undefined,
                        selectedVariant,
                      },
                    ]
                    : []
                }
                onClick={() => {
                  handleAddToCart();
                  open('cart');
                }}
                className={`btn h-16 w-full text-base ${added ? 'bg-pop-1 text-ink' : 'bg-cta text-cta-ink'}`}
              >
                {(fetcher) => {
                  const isAdding = fetcher.state !== 'idle';

                  if (!selectedVariant?.availableForSale) {
                    return (
                      <>
                        <ShoppingBag className="h-5 w-5" />
                        Sold out
                      </>
                    );
                  }

                  if (isAdding) {
                    return (
                      <>
                        <ShoppingBag className="h-5 w-5" />
                        Adding…
                      </>
                    );
                  }

                  if (added) {
                    return (
                      <>
                        <Check className="h-5 w-5" />
                        Added
                      </>
                    );
                  }

                  return (
                    <>
                      <ShoppingBag className="h-5 w-5" />
                      Add to bag
                    </>
                  );
                }}
              </AddToCartButton>
            </div>
          </motion.div>
        </div>

        <ProductStorytelling
          product={product}
          activeImage={activeImage}
        />

        {isImageModalOpen && activeImage ? (
          <div
            className="fixed inset-0 z-[70] bg-ink/90 px-4 py-8"
            onClick={() => setIsImageModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Product image preview"
          >
            <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className={`${squareButton} absolute right-5 top-5`}
                aria-label="Close image preview"
              >
                <X className="h-5 w-5" />
              </button>

              <div
                className="relative flex h-full w-full items-center justify-center"
                onClick={(event) => event.stopPropagation()}
              >
                <img
                  src={activeImage.url}
                  alt={activeImage.altText || product.title}
                  className="max-h-[90vh] max-w-full border-2 border-paper-2 object-contain"
                />

                {hasMultipleImages ? (
                  <>
                    <button type="button" onClick={goToPreviousImage} className={`${squareButton} absolute left-1 top-1/2 -translate-y-1/2`} aria-label="Previous product image">
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={goToNextImage} className={`${squareButton} absolute right-1 top-1/2 -translate-y-1/2`} aria-label="Next product image">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    images(first: 12) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
    metafield(namespace: "custom", key: "roast_level") {
      value
    }
    shortDescription: metafield(namespace: "custom", key: "short_description") {
      value
    }
    storytellingOverview: metafield(namespace: "custom", key: "storytelling_overview") {
      value
    }
    storytellingProducer: metafield(namespace: "custom", key: "storytelling_producer") {
      value
    }
    storytellingOrigin: metafield(namespace: "custom", key: "storytelling_origin") {
      value
    }
    storytellingProcess: metafield(namespace: "custom", key: "storytelling_process") {
      value
    }
    storytellingRoast: metafield(namespace: "custom", key: "storytelling_roast") {
      value
    }
    storytellingBrew: metafield(namespace: "custom", key: "storytelling_brew") {
      value
    }
    storytellingOverviewImage: metafield(namespace: "custom", key: "storytelling_overview_image") {
  reference {
    ... on MediaImage {
      image {
        url
        altText
        width
        height
      }
    }
  }
}

storytellingProducerImage: metafield(namespace: "custom", key: "storytelling_producer_image") {
  reference {
    ... on MediaImage {
      image {
        url
        altText
        width
        height
      }
    }
  }
}

storytellingOriginImage: metafield(namespace: "custom", key: "storytelling_origin_image") {
  reference {
    ... on MediaImage {
      image {
        url
        altText
        width
        height
      }
    }
  }
}

storytellingProcessImage: metafield(namespace: "custom", key: "storytelling_process_image") {
  reference {
    ... on MediaImage {
      image {
        url
        altText
        width
        height
      }
    }
  }
}

storytellingRoastImage: metafield(namespace: "custom", key: "storytelling_roast_image") {
  reference {
    ... on MediaImage {
      image {
        url
        altText
        width
        height
      }
    }
  }
}

storytellingBrewImage: metafield(namespace: "custom", key: "storytelling_brew_image") {
  reference {
    ... on MediaImage {
      image {
        url
        altText
        width
        height
      }
    }
  }
}
    collections(first: 20) {
      nodes {
        handle
      }
    }
    sellingPlanGroups(first: 10) {
      nodes {
        sellingPlans(first: 20) {
          nodes {
            id
            name
          }
        }
      }
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;

/** @typedef {import('./+types/products.$handle').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */