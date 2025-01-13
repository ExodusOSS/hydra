import lodash from 'lodash'
import { createSelector } from 'reselect'
import { isNumberUnit } from '@exodus/currency'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const selectorFactory = (getFeeDataSelector, assetsSelector) =>
  memoize((assetName) =>
    createSelector(getFeeDataSelector, assetsSelector, (getFeeData, assets) => {
      const asset = assets[assetName]
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
    { module: 'assets', selector: 'all' },
  ],
}

export default createFuelThresholdSelectorDefinition
