import {seoMeta} from '~/lib/meta';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({matches}) => seoMeta({title: 'Addresses', matches});

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address = {};
    const keys = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

export default function Addresses() {
  const {customer} = useOutletContext();
  const {defaultAddress, addresses} = customer;

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <section>
        <h2 className="mb-6 text-3xl">Saved addresses</h2>
        {addresses.nodes.length > 0 ? (
          <ExistingAddresses
            addresses={addresses}
            defaultAddress={defaultAddress}
          />
        ) : (
          <p className="block-card m-0 p-6 text-sm">
            No saved addresses yet. Add one and it&apos;ll be ready at checkout.
          </p>
        )}
      </section>

      <section className="block-card p-6 md:p-8 lg:sticky lg:top-28">
        <h2 className="mb-6 text-3xl">Add new address</h2>
        <NewAddressForm key={addresses.nodes.length} />
      </section>
    </div>
  );
}

function NewAddressForm() {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: '',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
    >
      {({stateForMethod}) => (
        <button
          disabled={stateForMethod('POST') !== 'idle'}
          formMethod="POST"
          type="submit"
          className="btn-ink"
        >
          {stateForMethod('POST') !== 'idle' ? 'Adding…' : 'Add address'}
        </button>
      )}
    </AddressForm>
  );
}

/**
 * @param {Pick<CustomerFragment, 'addresses' | 'defaultAddress'>}
 */
function ExistingAddresses({addresses, defaultAddress}) {
  const {state, formMethod, formData} = useNavigation();
  const deletingId =
    state !== 'idle' && formMethod === 'DELETE' ? formData?.get('addressId') : null;

  return (
    <div className="flex flex-col gap-4">
      {addresses.nodes.map((address) => {
        const isDefault = defaultAddress?.id === address.id;
        const isDeleting = deletingId === address.id;
        const nameLine = [address.firstName, address.lastName].filter(Boolean).join(' ');
        const cityLine = [address.city, address.zoneCode, address.zip].filter(Boolean).join(', ');

        return (
          <div key={address.id} className="block-card p-5 flex items-start justify-between gap-4">
            <div className="text-sm space-y-0.5">
              {isDefault && (
                <span className="eyebrow mb-3 inline-block border-2 border-ink bg-pop-1 px-2 py-0.5 text-[0.6rem]">
                  Default
                </span>
              )}
              {nameLine && <p className="mb-1 font-display text-base uppercase">{nameLine}</p>}
              {address.company && <p className="text-muted-foreground">{address.company}</p>}
              {address.address1 && <p className="text-muted-foreground">{address.address1}</p>}
              {address.address2 && <p className="text-muted-foreground">{address.address2}</p>}
              {cityLine && <p className="text-muted-foreground">{cityLine}</p>}
              {address.territoryCode && <p className="text-muted-foreground">{address.territoryCode}</p>}
              {address.phoneNumber && <p className="text-muted-foreground">{address.phoneNumber}</p>}
            </div>

            <Form method="DELETE" className="shrink-0">
              <input type="hidden" name="addressId" value={address.id} />
              <button
                type="submit"
                disabled={isDeleting}
                className="text-sm font-bold text-destructive underline underline-offset-4 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Removing…' : 'Remove'}
              </button>
            </Form>
          </div>
        );
      })}
    </div>
  );
}

/**
 * @param {{
 *   addressId: AddressFragment['id'];
 *   address: CustomerAddressInput;
 *   defaultAddress: CustomerFragment['defaultAddress'];
 *   children: (props: {
 *     stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
 *   }) => React.ReactNode;
 * }}
 */
export function AddressForm({addressId, address, defaultAddress, children}) {
  const {state, formMethod} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;

  return (
    <Form id={addressId} style={{maxWidth: '100%'}}>
      <input type="hidden" name="addressId" defaultValue={addressId} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-firstName`} className="account-label">First name*</label>
          <input className="account-input" aria-label="First name" autoComplete="given-name"
            defaultValue={address?.firstName ?? ''} id={`${addressId}-firstName`}
            name="firstName" placeholder="First name" required type="text" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-lastName`} className="account-label">Last name*</label>
          <input className="account-input" aria-label="Last name" autoComplete="family-name"
            defaultValue={address?.lastName ?? ''} id={`${addressId}-lastName`}
            name="lastName" placeholder="Last name" required type="text" />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-company`} className="account-label">Company</label>
          <input className="account-input" aria-label="Company" autoComplete="organization"
            defaultValue={address?.company ?? ''} id={`${addressId}-company`}
            name="company" placeholder="Company" type="text" />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-address1`} className="account-label">Address*</label>
          <input className="account-input" aria-label="Address line 1" autoComplete="address-line1"
            defaultValue={address?.address1 ?? ''} id={`${addressId}-address1`}
            name="address1" placeholder="Street address" required type="text" />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-address2`} className="account-label">Apt, suite, etc.</label>
          <input className="account-input" aria-label="Address line 2" autoComplete="address-line2"
            defaultValue={address?.address2 ?? ''} id={`${addressId}-address2`}
            name="address2" placeholder="Apartment, suite, etc." type="text" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-city`} className="account-label">City*</label>
          <input className="account-input" aria-label="City" autoComplete="address-level2"
            defaultValue={address?.city ?? ''} id={`${addressId}-city`}
            name="city" placeholder="City" required type="text" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-zoneCode`} className="account-label">State*</label>
          <input className="account-input" aria-label="State/Province" autoComplete="address-level1"
            defaultValue={address?.zoneCode ?? ''} id={`${addressId}-zoneCode`}
            name="zoneCode" placeholder="State / Province" required type="text" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-zip`} className="account-label">ZIP*</label>
          <input className="account-input" aria-label="Zip" autoComplete="postal-code"
            defaultValue={address?.zip ?? ''} id={`${addressId}-zip`}
            name="zip" placeholder="Postal code" required type="text" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-territoryCode`} className="account-label">Country*</label>
          <input className="account-input" aria-label="Country code" autoComplete="country"
            defaultValue={address?.territoryCode ?? ''} id={`${addressId}-territoryCode`}
            name="territoryCode" placeholder="US" required type="text" maxLength={2} />
        </div>
        <div className="col-span-2 flex flex-col gap-1.5">
          <label htmlFor={`${addressId}-phoneNumber`} className="account-label">Phone</label>
          <input className="account-input" aria-label="Phone Number" autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ''} id={`${addressId}-phoneNumber`}
            name="phoneNumber" placeholder="+1 (555) 000-0000"
            pattern="^\+?[1-9]\d{3,14}$" type="tel" />
        </div>
        <div className="col-span-2 flex items-center gap-2 mt-1">
          <input
            defaultChecked={isDefaultAddress}
            id={`${addressId}-defaultAddress`}
            name="defaultAddress"
            type="checkbox"
            className="w-4 h-4 accent-[var(--foreground)]"
          />
          <label htmlFor={`${addressId}-defaultAddress`} className="text-sm text-muted-foreground">
            Set as default address
          </label>
        </div>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive font-semibold">{error}</p>
      )}

      <div className="mt-4">
        {children({
          stateForMethod: (method) => (formMethod === method ? state : 'idle'),
        })}
      </div>
    </Form>
  );
}

/**
 * @typedef {{
 *   addressId?: string | null;
 *   createdAddress?: AddressFragment;
 *   defaultAddress?: string | null;
 *   deletedAddress?: string | null;
 *   error: Record<AddressFragment['id'], string> | null;
 *   updatedAddress?: AddressFragment;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerAddressInput} CustomerAddressInput */
/** @typedef {import('customer-accountapi.generated').AddressFragment} AddressFragment */
/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('./+types/account.addresses').Route} Route */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof action>} ActionReturnData */
