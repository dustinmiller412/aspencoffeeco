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

  const fallbackDescriptionParagraphs = useMemo(() => {
    return (product?.description || '')
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [product?.description]);

  const heroHook = useMemo(() => {
    const metafieldText = product?.shortDescription?.value;

    if (metafieldText) return metafieldText;

    const fallback = fallbackDescriptionParagraphs[0] || '';
    if (!fallback) return '';

    // Trim fallback so it doesn't get long
    const trimmed = fallback.slice(0, 1000);
    const lastSpace = trimmed.lastIndexOf(' ');

    return fallback.length > 220
      ? `${trimmed.slice(0, lastSpace)}...`
      : fallback;
  }, [product?.shortDescription?.value, fallbackDescriptionParagraphs]);

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

  return (
    <div className="pt-28 md:pt-48 pb-24 px-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <NavLink
          to={backToShopPath}
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Shop
        </NavLink>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="lg:sticky lg:top-36 lg:self-start"
          >
            <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
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
                    className="w-full h-full object-cover"
                  />
                </button>
              ) : null}

              {hasMultipleImages ? (
                <>
                  <button
                    type="button"
                    onClick={goToPreviousImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-black/35 text-white transition-colors hover:bg-black/55"
                    aria-label="Previous product image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-black/35 text-white transition-colors hover:bg-black/55"
                    aria-label="Next product image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              ) : null}
            </div>

            {hasMultipleImages ? (
              <div className="mt-4 flex items-center justify-center gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={image.id || image.url || index}
                    type="button"
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      index === currentImageIndex
                        ? 'bg-foreground'
                        : 'bg-foreground/30 hover:bg-foreground/50'
                    }`}
                    aria-label={`Go to product image ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center max-w-xl"
          >
            <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              {product.vendor || 'Aspen Coffee Co'}
            </p>

            <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-5 leading-tight">
              {product.title}
            </h1>

            {heroHook ? (
              <p className="text-base md:text-lg leading-relaxed whitespace-pre-line text-muted-foreground mb-8 max-w-lg">
                {heroHook}
              </p>
            ) : null}

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                {selectedVariant?.price && (
                  <span className="font-serif text-3xl font-medium">
                    ${formatProductPrice(selectedVariant.price.amount)}
                  </span>
                )}

                <div className="flex items-center border border-border">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-10 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Decrease quantity"
                  >
                    –
                  </button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-10 h-12 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
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
                <p className="text-sm text-muted-foreground -mt-2">
                  Not sure what grind size to choose?{' '}
                  <NavLink
                    to="/grind-size-guide"
                    className="underline underline-offset-4 hover:text-foreground transition-colors"
                  >
                    Check out our Grind Size Guide
                  </NavLink>
                </p>
              ) : null}

              {sellingPlans.length ? (
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Purchase Option
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {!isSubscriptionProduct ? (
                      <button
                        type="button"
                        onClick={() => setSelectedSellingPlanId('')}
                        className={`h-10 border px-4 text-xs uppercase tracking-[0.12em] transition-colors ${!selectedSellingPlanId
                            ? 'border-foreground text-foreground'
                            : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        One-time purchase
                      </button>
                    ) : null}

                    {sellingPlans.map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedSellingPlanId(plan.id)}
                        className={`h-10 border px-4 text-xs uppercase tracking-[0.12em] transition-colors ${effectiveSellingPlanId === plan.id
                            ? 'border-foreground text-foreground'
                            : 'border-border text-muted-foreground hover:text-foreground'
                          }`}
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
                className={`inline-flex w-full h-14 items-center justify-center gap-3 px-6 text-[0.72rem] font-medium tracking-[0.16em] uppercase transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${added
                    ? 'bg-green-700 text-white'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 dark:hover:bg-primary/80'
                  }`}
              >
                {(fetcher) => {
                  const isAdding = fetcher.state !== 'idle';

                  if (!selectedVariant?.availableForSale) {
                    return (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Sold out
                      </>
                    );
                  }

                  if (isAdding) {
                    return (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        Adding...
                      </>
                    );
                  }

                  if (added) {
                    return (
                      <>
                        <Check className="w-4 h-4" />
                        Added
                      </>
                    );
                  }

                  return (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      Add to Bag
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
            className="fixed inset-0 z-50 bg-black/85 px-4 py-8"
            onClick={() => setIsImageModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Product image preview"
          >
            <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-center">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white transition-colors hover:bg-black/60"
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
                  className="max-h-[90vh] max-w-full object-contain"
                />

                {hasMultipleImages ? (
                  <>
                    <button
                      type="button"
                      onClick={goToPreviousImage}
                      className="absolute left-1 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white transition-colors hover:bg-black/60"
                      aria-label="Previous product image"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={goToNextImage}
                      className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white transition-colors hover:bg-black/60"
                      aria-label="Next product image"
                    >
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