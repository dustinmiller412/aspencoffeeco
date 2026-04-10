import {redirect} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Aspen Coffee Co | Field Notes'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params}) {
  if (params.articleHandle) {
    return redirect(`/blogs/${params.articleHandle}`, 301);
  }

  throw new Response('Not found', {status: 404});
}

export default function DeprecatedNestedBlogRoute() {
  return null;
}

/** @typedef {import('./+types/blogs.$blogHandle.$articleHandle').Route} Route */
