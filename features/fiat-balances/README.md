# @exodus/fiat-balances

This Exodus SDK feature tracks fiat-denominated balances for all enabled wallet accounts, based on the application's locale and [user's preferred currency](../locale). For crypto-denominated balances, check out [@exodus/balances](../balances).

## Install

```sh
yarn add @exodus/fiat-balances
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/
2. Run `selectors.fiatBalances.byAsset(store.getState())` in the Dev Tools Console to get fiat balances by asset aggregated across enabled wallet accounts.
3. Try out some other selectors from `selectors.fiatBalances`. See example usage in [tests](./redux/__tests__/selectors/).
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
// check your ETH balance in the user's preferred currency
selectors.fiatBalances.byAsset(store.getState()).ethereum.toDefaultString({ unit: true }) // 123.45 USD
// change currency
await exodus.locale.setCurrency('EUR')
selectors.fiatBalances.byAsset(store.getState()).ethereum.toDefaultString({ unit: true }) // 6.78 EUR
```

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK. Note that the balances feature currently doesn't provide a top level API and is meant to be used purely through selectors.

If you're building a feature that requires balances, add a dependency on the `fiatBalancesAtom` as below.

```js
const myModuleDefinition = {
  id: 'myModule',
  type: 'module',
  factory: ({ fiatBalancesAtom }) => {
    const doSomethingSpecial = async () => {
      const { balances } = await fiatBalancesAtom.get()
      console.log(
        '>>> total wallet balance',
        balances.totals.balance.toDefaultString({ unit: true })
      )
    }

    return {
      doSomethingSpecial,
    }
  },
  dependencies: ['fiatBalancesAtom'],
}
```

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import { selectors } from '~/ui/flux'

const MyComponent = () => {
  const totalWalletBalance = useSelector(
    selectors.fiatBalances.optimisticTotalBalance(store.getState())
  ) // returns a NumberUnit

  // create a function to convert ethereum to the user's preferred currency
  const ethToFiat = useSelector(selectors.fiatBalances.createAssetConversion('ethereum'))
  const ethBalanceInFiat = ethToFiat(ethereum.currency.defaultUnit(1))
}
```
