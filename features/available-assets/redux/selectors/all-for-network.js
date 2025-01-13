import lodash from 'lodash'
import { pickBy } from '@exodus/basic-utils'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const resultFunction = (availableAssets) =>
  memoize((baseAssetName) => {
    return pickBy(availableAssets, (asset) => asset.baseAsset.name === baseAssetName)
  })

const allForNetworkSelectorDefinition = {
  id: 'allForNetwork',
  resultFunction,
  dependencies: [
    //
    { selector: 'all' },
  ],
}

export default allForNetworkSelectorDefinition
