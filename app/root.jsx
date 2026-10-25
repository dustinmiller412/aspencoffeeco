import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {Toaster} from 'sonner';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  useSearchParams,
  useNavigate,
} from 'react-router';
import {useEffect, useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import indexStyles from '../index.css?url';
import {PageLayout} from './components/PageLayout';
import {seoMeta} from '~/lib/meta';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * Site-wide default title/description/share tags. Routes with their own meta override this;
 * it also titles the error page (e.g. 404s) since errors render through the root boundary.
 * @type {Route.MetaFunction}
 */
export const meta = ({error, matches}) =>
  seoMeta({
    title: error
      ? isRouteErrorResponse(error) && error.status === 404
        ? 'Page not found'
        : 'Something went wrong'
      : undefined,
    matches,
  });

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://shop.app',
    },
    {rel: 'icon', type: 'image/png', href: '/brand/logomark/favicon.png'},
    {rel: 'apple-touch-icon', href: '/brand/logomark/favicon.png'},
  ];
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    // This storefront's own origin, for absolute share-image URLs in meta tags.
    origin: new URL(args.request.url).origin,
    // New per page load; ContourDivider uses it to draw unique lines (same on server and client).
    contourSeed: Math.floor(Math.random() * 2 ** 31),
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        headerMenuHandle: 'main-menu', // Adjust to your header menu handle
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
      variables: {
        footerMenuHandle: 'footer', // Adjust to your footer menu handle
      },
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={indexStyles}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

function SubscribedToast() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (params.get('subscribed') !== 'true') return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      navigate('.', {replace: true, preventScrollReset: true});
    }, 4000);
    return () => clearTimeout(timer);
  }, [params, navigate]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{opacity: 0, y: 24}}
          animate={{opacity: 1, y: 0}}
          exit={{opacity: 0, y: 24}}
          transition={{duration: 0.35, ease: 'easeOut'}}
          className="block-card pointer-events-none fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 bg-cta px-6 py-4 text-center text-cta-ink"
        >
          <p className="eyebrow mb-1">You&apos;re confirmed</p>
          <p className="font-display text-sm uppercase">Welcome to the list. Your 10% off is on the way.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
      <SubscribedToast />
      <Toaster position="bottom-right" theme="light" toastOptions={{className: '! !border-2 !border-ink !bg-paper-2 !text-ink !shadow-block'}} />
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-pop-2 px-6 py-16">
      <div className="block-card w-full max-w-xl p-8 text-center shadow-block-lg md:p-12">
        <p className="eyebrow mb-4">Error {errorStatus}</p>
        <h1 className="m-0 text-6xl md:text-7xl">
          {errorStatus === 404 ? 'Lost the beans' : 'Something spilled'}
        </h1>
        <p className="mt-6 text-lg">
          {errorStatus === 404
            ? "We couldn't find that page. It may have moved or sold out."
            : 'Something went wrong on our end. Try again in a moment.'}
        </p>
        {errorStatus !== 404 && errorMessage ? (
          <pre className="mt-6 overflow-auto border-2 border-ink bg-paper p-4 text-left text-xs">{errorMessage}</pre>
        ) : null}
        <a href="/" className="btn-cta mt-8">
          Back home
        </a>
      </div>
    </div>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
