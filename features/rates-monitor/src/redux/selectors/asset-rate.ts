import { memoize } from '@exodus/basic-utils'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'

import type { Rate, RateByAssetTicker, RatesSelectorState } from '../types.js'
import type { FiatRatesSelector } from './fiat-rates.js'

const selectorFactory = (
  fiatRatesSelector: FiatRatesSelector,
  createAssetByNameSelector: CreateAssetByNameSelector
) =>
  memoize((assetName: string) =>
    createSelector(
      fiatRatesSelector,
      createAssetByNameSelector(assetName),
      (rates: RateByAssetTicker, asset: { ticker: string } | null): Rate | undefined => {
        if (!asset) return undefined
        const ticker = asset.ticker
        return rates[ticker]
      }
    )
  )

export type CreateAssetRateSelector = ReturnType<typeof selectorFactory>
type CreateAssetByNameSelector = (
  assetName: string
) => (state: RatesSelectorState) => { ticker: string } | null

const createAssetRateSelector = defineSelectorFactory({
  id: 'assetRate',
  selectorFactory,
  dependencies: [
    //
    { selector: 'fiatRates' },
    { selector: 'createAssetSelector', module: 'assets' }, // TODO: refactor assets-feature to TypeScript, import actual type
  ],
})

export default createAssetRateSelector
