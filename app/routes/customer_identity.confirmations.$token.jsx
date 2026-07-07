import {redirect} from 'react-router';

export async function loader({params}) {
  try {
    await fetch(
      `https://aspencoffeeco.myshopify.com/customer_identity/confirmations/${params.token}`,
    );
  } catch (_) {}

  return redirect('/?subscribed=true');
}
