# @exodus/balances

This Exodus SDK feature tracks the crypto-denominated balances for all enabled wallet accounts. For fiat-denominated balances, check out [@exodus/fiat-balances](../fiat-balances).

## Install

```sh
yarn add @exodus/balances
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/
2. Run `selectors.balances.byAsset(store.getState())` in the Dev Tools Console to get balances by asset aggregated across enabled wallet accounts.
3. Try out some other selectors from `selectors.balances`. See example usage in [tests](./redux/__tests__/selectors/).
4. Mock an address with a balance, tick the blockchain monitor and check your balance.

```js
// mock your ethereum address with one that has a balance
await exodus.debug.addressProvider.mockAddress({
  assetName: 'ethereum',
  walletAccount: 'exodus_0',
  address: '0x1111111111111111111111111111111111111111',
})
// force tick the ethereum monitor, or wait a while
await exodus.txLogMonitors.update({ assetName: 'ethereum', refresh: true })
// check your balance
selectors.balances
  .createTotal({ assetName: 'ethereum', walletAccount: 'exodus_0' })(store.getState())
  .toString()
```

### API Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK. Note that the balances feature currently doesn't provide a top level API and is meant to be used purely through selectors.

If you're building a feature that requires balances, add a dependency on the `balancesAtom` as below. See also the [available balance fields](./default-config.js).

```js
const myModuleDefinition = {
  id: 'myModule',
  type: 'module',
  factory: ({ balancesAtom }) => {
    const doSomethingSpecial = async () => {
      // {
      //   [walletAccount]: {
      //     [assetName]: {
      //       // e.g. 'total', 'spendable', 'unconfirmedSent', 'unconfirmedReceived'
      //       [balanceField]: NumberUnit, // see @exodus/currency
      //     }
      //   }
      // }
      const { balances } = await balancesAtom.get()
      // ...
    }

    return {
      doSomethingSpecial,
    }
  },
  dependencies: ['balancesAtom'],
}
```

### UI Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import { selectors } from '~/ui/flux'

const MyComponent = () => {
  const bitcoinBalance = useSelector(
    selectors.balances.createSpendable({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
    })
  ) // returns a NumberUnit
}
```

## Contributing

### WARNING: no asset specifics!

Do NOT introduce any asset specifics like `if (assetName === 'dogicorn') balance = balance.mul(2)`. All asset-specifics belong in `asset.api.getBalances` or other APIs inside the asset libraries.
