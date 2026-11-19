import { keyBy, pickBy } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const allAssetsSelectorDefinition = {
  id: 'all',
  resultFunction: (data) =>
    pickBy(data, (asset) => !asset.isCombined || asset.combinedAssetNames.length > 0),
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
  dependencies: [{ selector: 'all' }],
}

const createBaseAssetSelectorDefinition = {
  id: 'createBaseAssetSelector',
  selectorFactory: (dataSelector) =>
    memoize((assetName) => createSelector(dataSelector, (data) => data[assetName].baseAsset)),
  dependencies: [{ selector: 'all' }],
}

const createFeeAssetSelectorDefinition = {
  id: 'createFeeAssetSelector',
  selectorFactory: (dataSelector) =>
    memoize((assetName) => createSelector(dataSelector, (data) => data[assetName].feeAsset)),
  dependencies: [{ selector: 'all' }],
}

const getAssetSelectorDefinition = {
  id: 'getAsset',
  resultFunction: (assets) => (assetName) => assets[assetName],
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
      createSelector(multiAddressModeDataSelector, (multiAddressModeData) =>
        Boolean(multiAddressModeData[assetName])
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
