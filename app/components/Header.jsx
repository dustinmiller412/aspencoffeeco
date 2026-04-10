import {Suspense, useState, useEffect} from 'react';
import {Await, NavLink, useLocation} from 'react-router';
import {Menu, Moon, ShoppingBag, Sun, User, X} from 'lucide-react';
import {motion, AnimatePresence} from 'framer-motion';
import {useTheme} from 'next-themes';
import {useAside} from '~/components/Aside';

const NAV_LINKS = [
  {label: 'Home', path: '/'},
  {label: 'Shop', path: '/collections/coffee'},
  {label: 'About', path: '/about'},
  {label: 'Field Notes', path: '/fieldnotes'},
];

const ICON_BUTTON_CLASS =
  'inline-flex h-11 w-11 items-center justify-center rounded-full border border-transparent bg-transparent text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-border/80 hover:bg-foreground/[0.04]';

/**
 * @param {HeaderProps}
 */
export function Header({header, isLoggedIn, cart, publicStoreDomain}) {
  const {shop, menu} = header;
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const {resolvedTheme, setTheme} = useTheme();
  const {open} = useAside();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const isDark = resolvedTheme === 'dark';
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border/50 py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between gap-8">
          {/* Left: Navigation Links */}
          <div className="hidden md:flex items-center gap-10 flex-1 translate-y-[-4px]">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({isActive}) =>
                  `text-sm tracking-[0.15em] uppercase transition-colors duration-300 ${
                    isActive
                      ? 'text-foreground'
                      : 'text-foreground/75 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground'
                  }`
                }
                end={link.path === '/'}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Center: Logo */}
          <NavLink to="/" className="flex-shrink-0" end>
            <img
              src="/images/logo.svg"
              alt={shop.name}
              className={`w-auto brightness-[0.72] contrast-125 transition-all duration-500 dark:brightness-0 dark:invert ${
                scrolled ? 'h-24' : 'h-32'
              }`}
            />
          </NavLink>

          {/* Right: Icons */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <Suspense fallback={null}>
              <Await resolve={cart}>
                {(cart) => (
                  <button
                    type="button"
                    onClick={() => open('cart')}
                    className={`${ICON_BUTTON_CLASS} relative`}
                    aria-label="Shopping bag"
                  >
                    <ShoppingBag className="w-[1.35rem] h-[1.35rem]" strokeWidth={1.5} />
                    {cart?.totalQuantity > 0 && (
                      <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-semibold rounded-full h-5 w-5 flex items-center justify-center">
                        {cart.totalQuantity}
                      </span>
                    )}
                  </button>
                )}
              </Await>
            </Suspense>

            <Suspense fallback={null}>
              <Await resolve={isLoggedIn}>
                {(isLoggedIn) => (
                  <NavLink
                    to={isLoggedIn ? '/account' : '/account/login'}
                    className={ICON_BUTTON_CLASS}
                    aria-label={isLoggedIn ? 'Account' : 'Sign in'}
                  >
                    <User className="w-[1.35rem] h-[1.35rem]" strokeWidth={1.75} />
                  </NavLink>
                )}
              </Await>
            </Suspense>

            <button
              onClick={toggleTheme}
              className={`${ICON_BUTTON_CLASS} hidden md:inline-flex border-border/60 bg-background/80`}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
            >
              {isDark ? (
                <Sun className="w-[1.1rem] h-[1.1rem]" strokeWidth={1.75} />
              ) : (
                <Moon className="w-[1.1rem] h-[1.1rem]" strokeWidth={1.75} />
              )}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`${ICON_BUTTON_CLASS} md:hidden`}
              aria-label="Menu"
            >
              {isOpen ? (
                <X className="w-[1.35rem] h-[1.35rem]" />
              ) : (
                <Menu className="w-[1.35rem] h-[1.35rem]" />
              )}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            transition={{duration: 0.3}}
            className="fixed inset-0 z-40 bg-background pt-44 px-6 md:hidden"
          >
            <div className="mb-10 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Theme
              </span>
              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                type="button"
              >
                {isDark ? (
                  <Sun className="w-4 h-4" strokeWidth={1.75} />
                ) : (
                  <Moon className="w-4 h-4" strokeWidth={1.75} />
                )}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
            </div>
            <div className="flex flex-col gap-8">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({isActive}) =>
                    `font-serif text-4xl transition-colors ${
                      isActive
                        ? 'text-foreground'
                        : 'text-foreground/85 hover:text-foreground'
                    }`
                  }
                  end={link.path === '/'}
                >
                  {link.label}
                </NavLink>
              ))}

              <Suspense fallback={null}>
                <Await resolve={isLoggedIn}>
                  {(isLoggedIn) => (
                    <NavLink
                      to={isLoggedIn ? '/account' : '/account/login'}
                      className="font-serif text-4xl text-foreground/85 transition-colors hover:text-foreground"
                    >
                      {isLoggedIn ? 'Account' : 'Sign In'}
                    </NavLink>
                  )}
                </Await>
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


