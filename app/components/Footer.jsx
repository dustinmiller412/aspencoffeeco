import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import {Facebook, Instagram} from 'lucide-react';

const QUICK_LINKS = [
  {title: 'Home', to: '/'},
  {title: 'Shop', to: '/collections/coffee'},
  {title: 'About', to: '/about'},
  {title: 'Grind Size Guide', to: '/grind-size-guide'},
  {title: 'Field Notes', to: '/fieldnotes'},
  {title: 'Contact', to: '/contact'},
];

const SCA_BADGE_SRC = '/images/SCA-Member2026-Badge-GreyYellow-8.png';

/**
 * @param {FooterProps}
 */
export function Footer({footer: footerPromise, header, publicStoreDomain}) {
  const shopName = header?.shop?.name || 'Aspen Coffee Co';
  const primaryDomainUrl = header?.shop?.primaryDomain?.url;

  return (
    <Suspense fallback={<FooterSkeleton shopName={shopName} />}>
      <Await resolve={footerPromise}>
        {(footer) => {
          const policyItems = (footer?.menu || FALLBACK_FOOTER_MENU).items;
          const visiblePolicyItems = policyItems.filter((item) => {
            const title = (item?.title || '').toLowerCase().trim();
            const url = (item?.url || '').toLowerCase();
            return title !== 'search' && !url.includes('/search');
          });

          return (
            <footer className="relative mt-10 border-t border-[#ded2c4] bg-[linear-gradient(180deg,#f7efe4_0%,#f3e8da_40%,#efe1cf_100%)] px-6 py-16 dark:border-white/10 dark:bg-[linear-gradient(180deg,#171311_0%,#1d1713_45%,#211914_100%)]">
              <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.3fr_0.9fr_1fr_0.85fr]">
                <div>
                  <p className="mb-4 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    {shopName}
                  </p>
                  <h2 className="max-w-md font-serif text-3xl font-medium leading-[0.98] tracking-[0.01em] text-foreground md:text-4xl">
                    Crafted in Pittsburgh.<br/> Coffee worth slowing down for.
                  </h2>
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Small-batch roasting, rotating seasonal selections, and a cup that feels intentional from first sip to last.
                  </p>

                </div>

                <div>
                  <p className="mb-5 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    Explore
                  </p>
                  <nav className="flex flex-col gap-3" role="navigation" aria-label="Footer navigation">
                    {QUICK_LINKS.map((link) => (
                      <NavLink
                        key={link.to}
                        to={link.to}
                        prefetch="intent"
                        className={({isActive}) =>
                          `w-fit text-sm uppercase tracking-[0.12em] transition-colors ${
                            isActive
                              ? 'text-foreground'
                              : 'text-muted-foreground hover:text-foreground'
                          }`
                        }
                        end={link.to === '/'}
                      >
                        {link.title}
                      </NavLink>
                    ))}
                  </nav>
                </div>

                <div>
                  <p className="mb-5 text-xs uppercase tracking-[0.28em] text-muted-foreground">
                    Policies
                  </p>
                  <nav className="flex flex-col gap-3" role="navigation" aria-label="Policy links">
                    {visiblePolicyItems.map((item) => {
                      if (!item.url) return null;

                      const url = normalizeMenuUrl({
                        itemUrl: item.url,
                        primaryDomainUrl,
                        publicStoreDomain,
                      });

                      const isExternal = !url.startsWith('/');
                      const baseClassName =
                        'w-fit text-sm uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-foreground';

                      return isExternal ? (
                        <a
                          href={url}
                          key={item.id}
                          rel="noopener noreferrer"
                          target="_blank"
                          className={baseClassName}
                        >
                          {item.title}
                        </a>
                      ) : (
                        <NavLink
                          end
                          key={item.id}
                          prefetch="intent"
                          to={url}
                          className={({isActive}) =>
                            `${baseClassName} ${isActive ? 'text-foreground' : ''}`
                          }
                        >
                          {item.title}
                        </NavLink>
                      );
                    })}
                  </nav>
                </div>

                <div className="flex justify-center md:justify-start">
                  <img
                    src={SCA_BADGE_SRC}
                    alt="Specialty Coffee Association member badge"
                    className="h-auto w-36 opacity-90"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-4 border-t border-[#d8c9b8] pt-6 text-xs uppercase tracking-[0.16em] text-muted-foreground dark:border-white/10 md:grid-cols-3 md:items-center">
                <p className="text-center md:text-left">© {new Date().getFullYear()} {shopName}</p>

                <div className="flex items-center justify-center gap-4">
                  <a
                    href="https://instagram.com/aspencoffee.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7c8b8] text-muted-foreground transition-colors hover:text-foreground dark:border-white/20"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a
                    href="https://www.facebook.com/profile.php?id=61587097293266"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7c8b8] text-muted-foreground transition-colors hover:text-foreground dark:border-white/20"
                    aria-label="Facebook"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                </div>

                <p className="text-center md:text-right">Freshly roasted in Pittsburgh, PA</p>
              </div>
            </footer>
          );
        }}
      </Await>
    </Suspense>
  );
}

function FooterSkeleton({shopName}) {
  return (
    <footer className="mt-10 border-t border-[#ded2c4] bg-[linear-gradient(180deg,#f7efe4_0%,#f3e8da_40%,#efe1cf_100%)] px-6 py-16 dark:border-white/10 dark:bg-[linear-gradient(180deg,#171311_0%,#1d1713_45%,#211914_100%)]">
      <div className="mx-auto max-w-7xl text-xs uppercase tracking-[0.28em] text-muted-foreground">
        {shopName}
      </div>
    </footer>
  );
}

function normalizeMenuUrl({itemUrl, primaryDomainUrl, publicStoreDomain}) {
  try {
    let normalizedUrl = itemUrl;

    if (
      itemUrl.includes('myshopify.com') ||
      itemUrl.includes(publicStoreDomain) ||
      (primaryDomainUrl && itemUrl.includes(primaryDomainUrl))
    ) {
      normalizedUrl = new URL(itemUrl).pathname;
    }

    // Map Shopify page URL to the custom About route in this storefront.
    if (normalizedUrl === '/pages/about' || normalizedUrl === '/pages/about/') {
      return '/about';
    }

    return normalizedUrl;
  } catch {
    return itemUrl;
  }
}

const FALLBACK_FOOTER_MENU = {
  id: 'gid://shopify/Menu/199655620664',
  items: [
    {
      id: 'gid://shopify/MenuItem/461633060920',
      resourceId: 'gid://shopify/ShopPolicy/23358046264',
      tags: [],
      title: 'Privacy Policy',
      type: 'SHOP_POLICY',
      url: '/policies/privacy-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633093688',
      resourceId: 'gid://shopify/ShopPolicy/23358013496',
      tags: [],
      title: 'Refund Policy',
      type: 'SHOP_POLICY',
      url: '/policies/refund-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633126456',
      resourceId: 'gid://shopify/ShopPolicy/23358111800',
      tags: [],
      title: 'Shipping Policy',
      type: 'SHOP_POLICY',
      url: '/policies/shipping-policy',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461633159224',
      resourceId: 'gid://shopify/ShopPolicy/23358079032',
      tags: [],
      title: 'Terms of Service',
      type: 'SHOP_POLICY',
      url: '/policies/terms-of-service',
      items: [],
    },
  ],
};

/**
 * @typedef {Object} FooterProps
 * @property {Promise<FooterQuery|null>} footer
 * @property {HeaderQuery} header
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').FooterQuery} FooterQuery */
/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
