import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { RateByAssetTicker } from '../types.js'

const resultFunction = (
  rates: RateByAssetTicker,
  loading: boolean,
  currencyName: string,
  getAssetFromTicker: (ticker: string) => { name: string } | undefined
) =>
  loading
    ? {}
    : Object.keys(rates).reduce<Record<string, Record<string, number>>>((acc, ticker) => {
        const asset = getAssetFromTicker(ticker)
        if (!asset) {
          console.warn('pricesByAssetNameSelector missing asset when looking for ticker', ticker)
          return acc
        }

        acc[asset.name] = {
          USD: rates[ticker]?.priceUSD || 0,
          [currencyName]: rates[ticker]?.price || 0,
        }
        return acc
      }, {})

const pricesByAssetNameSelector = {
  id: 'pricesByAssetName',
  resultFunction,
  dependencies: [
    //
    { selector: 'fiatRates' },
    { selector: 'loading' },
    { module: 'locale', selector: 'currency' },
    { module: 'assets', selector: 'getAssetFromTicker' },
  ],
} as const satisfies SelectorDefinition

export default pricesByAssetNameSelector
