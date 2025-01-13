import { TxSet } from '@exodus/models'
import { createReduxModuleHelper } from '@exodus/multi-account-redux'
import id from './id.js'

const helper = createReduxModuleHelper({
  slice: id,
  createInitialPerAssetData: () => TxSet.EMPTY,
})

export default helper
