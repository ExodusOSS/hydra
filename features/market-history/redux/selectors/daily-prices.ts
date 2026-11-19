import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { AssetPrices, GranularityPrices } from '../../types.js'

const DEFAULT: AssetPrices = Object.create(null)
const resultFunction = (fiatMarketHistory: GranularityPrices): AssetPrices =>
  fiatMarketHistory?.daily ?? DEFAULT

const dailyPricesSelector = {
  id: 'dailyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'fiatMarketHistory' },
  ],
} as const satisfies SelectorDefinition

export default dailyPricesSelector
