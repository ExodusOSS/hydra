import { createReduxModuleHelper } from '@exodus/multi-account-redux'
import id from './id'

const helper = createReduxModuleHelper({
  slice: id,
  createInitialPerAssetData: () => [],
})

export default helper
