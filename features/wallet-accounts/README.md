# @exodus/wallet-accounts

This feature offers a CRUD interface for wallet accounts, also known as portfolios from an end-user perspective.

## Install

```sh
yarn add @exodus/wallet-accounts
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground <https://exodus-hydra.pages.dev/features/wallet-accounts>
2. Try out some methods via the UI. These correspond 1:1 with the `exodus.walletAccounts` API.
3. Run `await exodus.walletAccounts.getEnabled()` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

```js
await exodus.walletAccounts.create({ source: WalletAccount.EXODUS_SRC })

const { exodus_1: created } = await exodus.walletAccounts.getEnabled()
await exodus.walletAccounts.disable(created.toString())

await exodus.walletAccounts.enable(created.toString())
```

If you're building a feature that requires readonly access to wallet accounts, add a dependency on `walletAccountsAtom`. See [legos](../../docs/development/legos.md#atoms) for more information on how atoms work.

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```jsx
import { selectors } from '~/ui/flux'

const MyComponent = () => {
  // selector definition https://github.com/ExodusMovement/exodus-hydra/blob/c0854e3fcce3d3d3d666f33b814430105225e97d/features/wallet-accounts/redux/selectors/active.js
  const activeWalletAccount = useSelector(selectors.walletAccounts.active)
  // ...
}
```
