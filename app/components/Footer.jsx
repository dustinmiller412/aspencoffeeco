import {Suspense} from 'react';
import {Await, NavLink} from 'react-router';
import {Facebook, Instagram} from 'lucide-react';
import {Logo} from '~/components/Header';
import NewsletterSection from '~/components/NewsletterSection';

const QUICK_LINKS = [
  {title: 'Home', to: '/'},
  {title: 'Shop', to: '/collections/coffee'},
  {title: 'About', to: '/about'},
  {title: 'Wholesale', to: '/wholesale'},
  {title: 'Grind Size Guide', to: '/grind-size-guide'},
  {title: 'Field Notes', to: '/fieldnotes'},
  {title: 'Contact', to: '/contact'},
];

const SOCIAL_LINKS = [
  {href: 'https://instagram.com/aspencoffee.co', label: 'Instagram', Icon: Instagram},
  {
    href: 'https://www.facebook.com/profile.php?id=61587097293266',
    label: 'Facebook',
    Icon: Facebook,
  },
];

const FOOTER_LINK_CLASS =
  'w-fit text-sm font-semibold uppercase tracking-[0.1em] text-paper-2/80 transition-colors hover:text-glow';

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
            <>
              <NewsletterSection />
              <footer className="bg-ink px-6 pb-10 pt-16 text-paper-2">
                <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <div>
                    <Logo variant="badge" label={shopName} className="mb-6 h-28 text-paper-2" />
                    <p className="max-w-sm text-sm leading-relaxed text-paper-2/75">
                      Small-batch roasting, rotating seasonal selections, and a cup
                      that feels intentional from first sip to last. Crafted in Pittsburgh.
                    </p>
                    <div className="mt-6 flex gap-3">
                      {SOCIAL_LINKS.map(({href, label, Icon}) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center border-2 border-paper-2/40 transition-colors hover:border-cta hover:bg-cta hover:text-cta-ink"
                          aria-label={label}
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="eyebrow mb-5 text-glow">Explore</p>
                    <nav className="flex flex-col gap-3" aria-label="Footer navigation">
                      {QUICK_LINKS.map((link) => (
                        <NavLink
                          key={link.to}
                          to={link.to}
                          prefetch="intent"
                          className={({isActive}) =>
                            `${FOOTER_LINK_CLASS} ${isActive ? 'text-glow' : ''}`
                          }
                          end={link.to === '/'}
                        >
                          {link.title}
                        </NavLink>
                      ))}
                    </nav>
                  </div>

                  <div>
                    <p className="eyebrow mb-5 text-glow">Policies</p>
                    <nav className="flex flex-col gap-3" aria-label="Policy links">
                      {visiblePolicyItems.map((item) => {
                        if (!item.url) return null;

                        const url = normalizeMenuUrl({
                          itemUrl: item.url,
                          primaryDomainUrl,
                          publicStoreDomain,
                        });

                        return url.startsWith('/') ? (
                          <NavLink
                            end
                            key={item.id}
                            prefetch="intent"
                            to={url}
                            className={({isActive}) =>
                              `${FOOTER_LINK_CLASS} ${isActive ? 'text-glow' : ''}`
                            }
                          >
                            {item.title}
                          </NavLink>
                        ) : (
                          <a
                            href={url}
                            key={item.id}
                            rel="noopener noreferrer"
                            target="_blank"
                            className={FOOTER_LINK_CLASS}
                          >
                            {item.title}
                          </a>
                        );
                      })}
                    </nav>
                  </div>

                  <img
                    src={SCA_BADGE_SRC}
                    alt="Specialty Coffee Association member badge"
                    className="h-auto w-28 self-start"
                    loading="lazy"
                  />
                </div>

                <Logo
                  variant="aspen"
                  label=""
                  className="mx-auto mt-16 w-full max-w-7xl text-paper-2/10"
                />

                <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t-2 border-paper-2/20 pt-6 text-xs font-semibold uppercase tracking-[0.16em] text-paper-2/60 md:flex-row md:justify-between">
                  <p>© {new Date().getFullYear()} {shopName}</p>
                  <p>Freshly roasted in Pittsburgh, PA</p>
                </div>
              </footer>
            </>
          );
        }}
      </Await>
    </Suspense>
  );
}

function FooterSkeleton({shopName}) {
  return (
    <footer className="mt-24 bg-ink px-6 py-16 text-paper-2">
      <div className="eyebrow mx-auto max-w-7xl">
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
