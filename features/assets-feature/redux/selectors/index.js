import { keyBy } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

import lodash from 'lodash'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

// just a semantic alias for `data`
const allAssetsSelectorDefinition = {
  id: 'all',
  resultFunction: (data) => data,
  dependencies: [{ selector: 'data' }],
}

const allByTickerSelectorDefinition = {
  id: 'allByTicker',
  resultFunction: (assets) => keyBy(Object.values(assets), (asset) => asset.ticker),
  dependencies: [{ selector: 'all' }],
}

const createAssetSelectorDefinition = {
  id: 'createAssetSelector',
  selectorFactory: (dataSelector) =>
    memoize((assetName) => createSelector(dataSelector, (data) => data[assetName])),
  dependencies: [{ selector: 'data' }],
}

const createBaseAssetSelectorDefinition = {
  id: 'createBaseAssetSelector',
  selectorFactory: (dataSelector) =>
    memoize((assetName) => createSelector(dataSelector, (data) => data[assetName].baseAsset)),
  dependencies: [{ selector: 'data' }],
}

const createFeeAssetSelectorDefinition = {
  id: 'createFeeAssetSelector',
  selectorFactory: (dataSelector) =>
    memoize((assetName) => createSelector(dataSelector, (data) => data[assetName].feeAsset)),
  dependencies: [{ selector: 'data' }],
}

const getAssetSelectorDefinition = {
  id: 'getAsset',
  resultFunction: (assets) =>
    memoize((assetName) => {
      if (!assetName) throw new Error('expected assetName')
      return assets[assetName]
    }),
  dependencies: [{ selector: 'all' }],
}

const getAssetFromTickerSelectorDefinition = {
  id: 'getAssetFromTicker',
  resultFunction: (assets) => memoize((ticker) => assets[ticker]),
  dependencies: [{ selector: 'allByTicker' }],
}

const createMultiAddressModeSelectorDefinition = {
  id: 'createMultiAddressMode',
  selectorFactory: (multiAddressModeDataSelector) =>
    memoize((assetName) =>
      createSelector(
        multiAddressModeDataSelector,
        (multiAddressModeData) =>
          multiAddressModeData[assetName] ?? multiAddressModeData.bitcoin ?? false
      )
    ),
  dependencies: [{ selector: 'multiAddressMode' }],
}

const createLegacyAddressModeSelectorDefinition = {
  id: 'createLegacyAddressMode',
  selectorFactory: (legacyAddressModeDataSelector) =>
    memoize((assetName) =>
      createSelector(
        legacyAddressModeDataSelector,
        (legacyAddressModeData) => legacyAddressModeData[assetName] || false
      )
    ),
  dependencies: [{ selector: 'legacyAddressMode' }],
}

const createTaprootAddressModeSelectorDefinition = {
  id: 'createTaprootAddressMode',
  selectorFactory: (taprootAddressModeDataSelector) =>
    memoize((assetName) =>
      createSelector(
        taprootAddressModeDataSelector,
        (taprootAddressModeData) => taprootAddressModeData[assetName] || false
      )
    ),
  dependencies: [{ selector: 'taprootAddressMode' }],
}

const createDisabledPurposesSelectorDefinition = {
  id: 'createDisabledPurposes',
  selectorFactory: (disabledPurposesDataSelector) => {
    const disabledPurposesDefaultValue = []
    return memoize((assetName) =>
      createSelector(
        disabledPurposesDataSelector,
        (disabledPurposesData) => disabledPurposesData[assetName] || disabledPurposesDefaultValue
      )
    )
  },
  dependencies: [{ selector: 'disabledPurposes' }],
}

const assetSelectors = [
  allAssetsSelectorDefinition,
  allByTickerSelectorDefinition,
  createAssetSelectorDefinition,
  createBaseAssetSelectorDefinition,
  createFeeAssetSelectorDefinition,
  getAssetSelectorDefinition,
  getAssetFromTickerSelectorDefinition,
  createMultiAddressModeSelectorDefinition,
  createDisabledPurposesSelectorDefinition,
  createLegacyAddressModeSelectorDefinition,
  createTaprootAddressModeSelectorDefinition,
]

export default assetSelectors
