# @exodus/market-history

This Exodus SDK feature tracks daily and hourly historical asset prices for different intervals. It return prices on interval `close`.

## Install

```sh
yarn add @exodus/market-history
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/market-history
2. Run `selectors.marketHistory.getAssetDailyPrice('bitcoin')(store.getState())(new Date())` in the Dev Tools Console.
3. Try out some other selectors from `selectors.marketHistory`. See example usage in [tests](./redux/__tests__/selectors/).

### API Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK.

If you're building a feature that requires historical asset prices, add a dependency on the `marketHistoryAtom`, which stores data in the following shape:

```js
{
  // most recent data
  data: {
    USD: {
      daily: {
        bitcoin: {
          1663668000000: 90000,
        }
      }
    }
  },
  // changes since the last update
  changes: {
    USD: {
      daily: {
        bitcoin: {
          1663671600000: 9000,
        }
      }
    }
  }
}
```

Market history is updated regularly, but if you need to urgently refetch prices for a given granularity, you can use:

```js
exodus.marketHistory.update(granularity) // granularity = 'daily' | 'hourly'
```

If you need to load prices for a certain date:

```js
await exodus.marketHistory.fetchAssetPricesFromDate({
  assetName: 'bitcoin',
  granularity: 'day',
  startTimestamp,
})

// `marketHistoryAtom` gets updated, new prices are available via selectors
```

### UI Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import selectors from '~/ui/flux/selectors'

const MyComponent = () => {
  const getBitcoinDailyPrice = useSelector(selectors.marketHistory.getAssetDailyPrice('bitcoin'))
  const bitcoinPrice = getBitcoinDailyPrice(new Date()) // Number, in the user's current currency
}
```
