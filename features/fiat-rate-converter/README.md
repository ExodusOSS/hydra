# @exodus/fiat-rate-converter

## Usage

To use this feature, provide it to the container and specify it as a dependency in any consumer that needs to use it.

```js
import fiatRateConverter from '@exodus/fiat-rate-converter'

exodus.use(fiatRateConverter({ defaultCurrency: 'USD' }))

// convert to default fiat currency
fiatRatesConverter.toFiatCurrency({
  amount,
  assetName,
})

// convert to specific fiat currency
fiatRatesConverter.toFiatCurrency({
  amount,
  assetName,
  currency,
})
```
