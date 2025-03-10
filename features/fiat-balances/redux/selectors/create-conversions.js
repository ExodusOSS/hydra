import { getCreateConversion } from '../../shared/get-create-conversion.js'
import { mapValues, memoize } from '@exodus/basic-utils'
import currencies from '@exodus/fiat-currencies'
import { createSelector } from 'reselect'

const selectorFactory = (assetsSelector, ratesSelector) =>
  memoize((fiatTicker) =>
    createSelector(assetsSelector, ratesSelector, (assets, rates) => {
      const createConversion = getCreateConversion(currencies[fiatTicker], rates[fiatTicker])
      return mapValues(assets, (asset) => createConversion(asset))
    })
  )

const createConversionsSelectorDefinition = {
  id: 'createConversions',
  selectorFactory,
  dependencies: [
    //
    { module: 'assets', selector: 'all' },
    { module: 'rates', selector: 'data' },
  ],
}

export default createConversionsSelectorDefinition
