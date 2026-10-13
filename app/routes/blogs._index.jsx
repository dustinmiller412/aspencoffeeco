import {redirect} from 'react-router';

// Legacy URL: Field Notes live at /fieldnotes.
export async function loader() {
  return redirect('/fieldnotes', 301);
}

/** @typedef {import('./+types/blogs._index').Route} Route */
