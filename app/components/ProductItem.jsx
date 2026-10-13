import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {formatProductPrice} from '~/lib/price';

/**
 * Blocky product card. First image is the tile, second (if any) fades in on hover.
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const [tile, photo] =
    product.images?.nodes ?? [product.featuredImage].filter(Boolean);
  const sizes = '(min-width: 64em) 25vw, (min-width: 40em) 50vw, 100vw';

  return (
    <Link
      className="block-card group flex h-full flex-col text-ink no-underline transition-[transform,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:no-underline hover:shadow-block-lg"
      prefetch="intent"
      to={variantUrl}
    >
      <div className="relative aspect-square overflow-hidden border-b-2 border-ink bg-paper">
        {tile && (
          <Image
            alt={tile.altText || product.title}
            aspectRatio="1/1"
            className="h-full w-full object-cover"
            data={tile}
            loading={loading}
            sizes={sizes}
          />
        )}
        {photo && (
          <Image
            alt={photo.altText || product.title}
            aspectRatio="1/1"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            data={photo}
            loading="lazy"
            sizes={sizes}
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {product.productType && (
          <p className="eyebrow opacity-70">{product.productType}</p>
        )}
        <h3 className="display text-xl">{product.title}</h3>
        <div className="mt-auto flex items-baseline justify-between pt-4">
          <span className="font-display text-lg">
            ${formatProductPrice(product.priceRange.minVariantPrice.amount)}
          </span>
          {product.availableForSale === false && (
            <span className="eyebrow opacity-70">Sold out</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
