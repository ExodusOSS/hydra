import lodash from 'lodash'
import { createSelector } from 'reselect'

import { _resultFunction } from './get-data.js'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const selectorFactory = (dataSelector, allAssetsSelector) =>
  memoize((assetName) =>
    createSelector(dataSelector, allAssetsSelector, (feeData, assets) =>
      _resultFunction({ feeData, assets, assetName })
    )
  )

const getDataSelectorDefinition = {
  id: 'createData',
  selectorFactory,
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'all', module: 'assets' },
  ],
}

export default getDataSelectorDefinition
