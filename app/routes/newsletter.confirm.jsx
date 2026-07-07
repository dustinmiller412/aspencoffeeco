import {redirect} from 'react-router';

export async function loader({request}) {
  const shopifyUrl = new URL(request.url).searchParams.get('url');

  if (shopifyUrl?.startsWith('https://aspencoffeeco.myshopify.com/')) {
    try {
      await fetch(shopifyUrl);
    } catch (_) {}
  }

  return redirect('/?subscribed=true');
}
