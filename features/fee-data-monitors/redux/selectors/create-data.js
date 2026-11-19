// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'

import { _resultFunction } from './get-data.js'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const selectorFactory = (dataSelector, createAssetSelector) =>
  memoize((assetName) =>
    createSelector(dataSelector, createAssetSelector(assetName), (feeData, asset) => {
      if (!asset) {
        console.warn(`"${assetName}" is not present in assets`)
        return
      }

      return _resultFunction({ feeData, asset })
    })
  )

const getDataSelectorDefinition = {
  id: 'createData',
  selectorFactory,
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'createAssetSelector', module: 'assets' },
  ],
}

export default getDataSelectorDefinition
