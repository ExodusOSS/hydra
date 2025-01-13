# @exodus/rates-monitor

## Usage

To use the module call the factory and pass in required dependencies. Rates will automatically update on currency or asset changes.

```ts
import createRatesMonitor from '@exodus/rates-monitor'

const ratesMonitor = createRatesMonitor({
  currencyAtom,
  pricingServer,
  getTicker,
  ratesNeededForAssetNamesAtom,
  fetchInterval: ms('1m'), // default
  debounceInterval: ms('0.75s'), // default
  ratesAtom,
})

// start the monitor
ratesMonitor.start()

// listen to the `rates` event
ratesMonitor.on('rates', ({ rates, currency }) => {
  const {
    [currency]: { price, priceUSD, change24, volume24, cap, invalid },
  } = rates
})

// re-emit cached rates
ratesMonitor.sync()
```
