import { memoize } from '@exodus/basic-utils'
import { createReduxModuleHelper } from '@exodus/multi-account-redux'
import id from './id.js'

const helper = createReduxModuleHelper({
  slice: id,
  createInitialPerAssetData: memoize(
    ({ asset }) => [],
    ({ asset }) => asset.name
  ),
})

export default helper
