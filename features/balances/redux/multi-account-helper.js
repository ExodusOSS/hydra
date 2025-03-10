import { memoize } from '@exodus/basic-utils'
import { createReduxModuleHelper } from '@exodus/multi-account-redux'
import id from './id.js'

const helper = createReduxModuleHelper({
  slice: id,
  createInitialPerAssetData: memoize(
    ({ asset }) => ({ balance: asset.currency.ZERO, total: asset.currency.ZERO }),
    ({ asset }) => asset.name
  ),
  assetSourceDataSelectors: [{ name: 'balance', selector: (assetData) => assetData.total }],
})

export default helper
