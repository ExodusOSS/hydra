import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { FiatCurrency, GranularityPrices, MarketHistoryData } from '../../types.js'

const DEFAULT: GranularityPrices = Object.create(null)
const resultFunction = (marketHistory: MarketHistoryData, fiat: FiatCurrency): GranularityPrices =>
  marketHistory?.[fiat.defaultUnit.unitName] ?? DEFAULT

const fiatMarketHistorySelector = {
  id: 'fiatMarketHistory',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
    { module: 'locale', selector: 'currencyUnitType' },
  ],
} as const satisfies SelectorDefinition

export default fiatMarketHistorySelector
