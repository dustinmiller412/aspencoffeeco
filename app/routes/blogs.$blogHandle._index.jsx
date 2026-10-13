import {redirect} from 'react-router';

// Legacy URL: Field Notes live at /fieldnotes/:slug.
/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  return redirect(`/fieldnotes/${params.blogHandle}`, 301);
}

/** @typedef {import('./+types/blogs.$blogHandle._index').Route} Route */
