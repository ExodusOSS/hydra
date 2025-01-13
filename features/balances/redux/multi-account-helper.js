import { createReduxModuleHelper } from '@exodus/multi-account-redux'
import id from './id.js'

const helper = createReduxModuleHelper({
  slice: id,
  createInitialPerAssetData: ({ asset }) => {
    return { balance: asset.currency.ZERO, total: asset.currency.ZERO }
  },
  assetSourceDataSelectors: [{ name: 'balance', selector: (assetData) => assetData.total }],
})

export default helper
