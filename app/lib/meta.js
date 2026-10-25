const SITE = 'Aspen Coffee Co';

export const DEFAULT_DESCRIPTION =
  'Small-batch specialty coffee roasted in Pittsburgh, PA. Single origins and house blends, with the stories of the people behind every cup.';

const DEFAULT_IMAGE_PATH = '/brand/og-image.png';

/** Trim to a search-snippet length (~155 chars) on a word boundary. */
export function clip(text = '', max = 155) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, t.lastIndexOf(' ', max - 1)).replace(/[,.;:]$/, '')}…`;
}

/** This storefront's origin (from the root loader), so share images get absolute URLs. */
function originFrom(matches) {
  return matches?.find((m) => m?.id === 'root')?.data?.origin ?? '';
}

/**
 * Title, description and social-share tags for a page.
 * @param {{
 *   title?: string;        // page name; rendered as "<title> | Aspen Coffee Co"
 *   fullTitle?: string;    // exact title, overrides `title`
 *   description?: string | null;
 *   image?: string | null; // absolute URL; defaults to the brand share card
 *   matches?: Array<any>;  // meta() `matches`, used to resolve the default image URL
 * }} options
 */
export function seoMeta({title, fullTitle, description, image, matches}) {
  const pageTitle = fullTitle ?? (title ? `${title} | ${SITE}` : SITE);
  const desc = clip(description || DEFAULT_DESCRIPTION);
  const img = image || `${originFrom(matches)}${DEFAULT_IMAGE_PATH}`;
  return [
    {title: pageTitle},
    {name: 'description', content: desc},
    {property: 'og:site_name', content: SITE},
    {property: 'og:title', content: pageTitle},
    {property: 'og:description', content: desc},
    {property: 'og:image', content: img},
    {property: 'og:type', content: 'website'},
    {name: 'twitter:card', content: 'summary_large_image'},
  ];
}
