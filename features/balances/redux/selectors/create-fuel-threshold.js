// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import { isNumberUnit } from '@exodus/currency'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const selectorFactory = (getFeeDataSelector, createAssetSelector) =>
  memoize((assetName) =>
    createSelector(getFeeDataSelector, createAssetSelector(assetName), (getFeeData, asset) => {
      if (!asset) {
        // not all assets are supported by Exodus.
        return null
      }

      const feeData = getFeeData(asset.baseAsset.name)
      return isNumberUnit(feeData?.fuelThreshold)
        ? feeData.fuelThreshold
        : asset.feeAsset.currency.ZERO
    })
  )

const createFuelThresholdSelectorDefinition = {
  id: 'createFuelThreshold',
  selectorFactory,
  dependencies: [
    { module: 'feeData', selector: 'getData' },
    { module: 'assets', selector: 'createAssetSelector' },
  ],
}

export default createFuelThresholdSelectorDefinition
