import {Suspense, useState, useEffect} from 'react';
import {Await, NavLink, useLocation} from 'react-router';
import {Menu, Search, ShoppingBag, User, X} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {useAside} from '~/components/Aside';
import {FREE_SHIPPING_THRESHOLD} from '~/components/CartSummary';

const NAV_LINKS = [
  {label: 'Shop', path: '/collections/coffee'},
  {label: 'About', path: '/about'},
  {label: 'Field Notes', path: '/fieldnotes'},
  {label: 'Wholesale', path: '/wholesale'},
];

const ICON_BUTTON_CLASS =
  'relative inline-flex h-11 w-11 items-center justify-center border-2 border-transparent text-ink transition-colors hover:border-ink hover:bg-paper-2';

export const LOGOS = {
  horizontal: {src: '/brand/horizontal/Asset 5.svg', ratio: '633 / 177'},
  stacked: {src: '/brand/stacked/stacked-web.png', ratio: '617 / 557'},
  badge: {src: '/brand/badge/badge-web.png', ratio: '1 / 1'},
  mark: {src: '/brand/logomark/logomark-web.png', ratio: '889 / 900'},
  wordmark: {src: '/brand/aspn/ASPN-trimmed.png', ratio: '610 / 145'},
  aspen: {src: '/brand/aspn/ASPEN-wordmark.png', ratio: '900 / 185'},
};

/**
 * Brand logo rendered as a mask so it takes the current text color.
 * Size it with a height (or width) class; the aspect ratio comes from the variant.
 * @param {{variant?: keyof typeof LOGOS, label?: string, className?: string}}
 */
export function Logo({variant = 'horizontal', label = 'Aspen Coffee Co', className = ''}) {
  const {src, ratio} = LOGOS[variant];
  const mask = `url("${encodeURI(src)}") center / contain no-repeat`;
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={`block bg-current ${className}`}
      style={{aspectRatio: ratio, mask, WebkitMask: mask}}
    />
  );
}

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart}) {
  const {shop} = header;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const {open} = useAside();

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <>
      <NavLink
        to="/collections/coffee"
        className="eyebrow block border-b-2 border-ink bg-cta px-4 py-2.5 text-center text-cta-ink no-underline hover:underline"
      >
        Free shipping on orders ${FREE_SHIPPING_THRESHOLD}+ <span aria-hidden="true">→</span>
      </NavLink>
      <nav className="sticky top-0 z-50 border-b-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 md:px-6">
          <div className="hidden flex-1 items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({isActive}) =>
                  `border-2 px-3 py-1.5 font-display text-xs uppercase tracking-wide transition-colors ${
                    isActive
                      ? 'border-ink bg-ink text-paper-2'
                      : 'border-transparent text-ink hover:border-ink hover:bg-paper-2'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Same flex-1 as the icon group on the right, so the logo stays centered on mobile. */}
          <div className="flex flex-1 md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={ICON_BUTTON_CLASS}
              aria-label="Menu"
              type="button"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <NavLink to="/" className="flex-shrink-0 text-ink" end>
            <Logo label={shop.name} className="h-10 md:h-12" />
          </NavLink>

          <div className="flex flex-1 items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => open('search')}
              className={`${ICON_BUTTON_CLASS} hidden md:inline-flex`}
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={2.25} />
            </button>

            <Suspense fallback={null}>
              <Await resolve={isLoggedIn}>
                {(isLoggedIn) => (
                  <NavLink
                    to={isLoggedIn ? '/account' : '/account/login'}
                    className={`${ICON_BUTTON_CLASS} hidden md:inline-flex`}
                    aria-label={isLoggedIn ? 'Account' : 'Sign in'}
                  >
                    <User className="h-5 w-5" strokeWidth={2.25} />
                  </NavLink>
                )}
              </Await>
            </Suspense>

            <Suspense fallback={null}>
              <Await resolve={cart}>
                {(cart) => (
                  <button
                    type="button"
                    onClick={() => open('cart')}
                    className={ICON_BUTTON_CLASS}
                    aria-label="Shopping bag"
                  >
                    <ShoppingBag className="h-5 w-5" strokeWidth={2.25} />
                    {cart?.totalQuantity > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center border-2 border-ink bg-cta px-1 text-[0.65rem] font-bold text-cta-ink">
                        {cart.totalQuantity}
                      </span>
                    )}
                  </button>
                )}
              </Await>
            </Suspense>
          </div>
        </div>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{opacity: 0, y: -12}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -12}}
              transition={{duration: 0.2}}
              className="absolute inset-x-0 top-full h-[calc(100dvh-5.5rem)] overflow-y-auto border-b-2 border-ink bg-paper px-4 py-8 md:hidden"
            >
              <div className="flex flex-col gap-3">
                {[{label: 'Home', path: '/'}, ...NAV_LINKS].map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.path === '/'}
                    className={({isActive}) =>
                      `block-card px-5 py-4 font-display text-3xl uppercase ${
                        isActive ? 'bg-cta text-cta-ink' : 'text-ink'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => open('search')} className="btn-outline">
                    <Search className="h-4 w-4" /> Search
                  </button>
                  <Suspense fallback={null}>
                    <Await resolve={isLoggedIn}>
                      {(isLoggedIn) => (
                        <NavLink
                          to={isLoggedIn ? '/account' : '/account/login'}
                          className="btn-outline"
                        >
                          <User className="h-4 w-4" /> {isLoggedIn ? 'Account' : 'Sign in'}
                        </NavLink>
                      )}
                    </Await>
                  </Suspense>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

    </>
  );
}

/**
 * @typedef {Object} HeaderProps
 * @property {HeaderQuery} header
 * @property {Promise<CartApiQueryFragment|null>} cart
 * @property {Promise<boolean>} isLoggedIn
 * @property {string} publicStoreDomain
 */

/** @typedef {import('storefrontapi.generated').HeaderQuery} HeaderQuery */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
