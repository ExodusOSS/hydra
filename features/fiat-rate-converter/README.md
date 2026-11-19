# @exodus/fiat-rate-converter

This Exodus SDK feature provides rate conversion between assets and fiat currencies.

## Install

```sh
pnpm add @exodus/fiat-rate-converter
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

```js
import createExodus from '@exodus/headless'
import fiatRateConverter from '@exodus/fiat-rate-converter'

const container = createExodus({ adapters, config, debug })
// defaults to USD
container.use(fiatRateConverter())
// specify a different default currency as follows
// container.use(fiatRateConverter({ defaultCurrency: 'EUR' }))
```

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK. Add `fiatRateConverter` as a dependency to use as follows:

```js
import { WalletAccount } from '@exodus/models'

const myModuleDefinition = {
  id: 'myModule',
  type: 'module',
  factory: ({ assetsModule, fiatRateConverter }) => {
    const doSomethingSpecial = async () => {
      const dollarsInABitcoin = fiatRateConverter.toFiatCurrency({
        amount: assetsModule.getAsset('bitcoin').currency.defaultUnit(1),
        currency: 'EUR', // or omit to use default fiat currency
      })
    }

    return {
      doSomethingSpecial,
    }
  },
  dependencies: ['assetsModule', 'fiatRateConverter'],
}
```

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

This feature currently doesn't provide a top-level API or selectors and is meant to be used purely through dependency injection.
