import { createReduxModuleHelper } from '@exodus/multi-account-redux'
import id from './id.js'

const helper = createReduxModuleHelper({
  slice: id,
  createInitialPerAssetData: ({ state, asset }) => {
    // TODO: check `asset.api.features.accountState` instead, when `asset.api.features` becomes available
    if (asset.name !== asset.baseAsset.name) {
      console.warn(
        `createInitialPerAssetData was called for token "${asset.name}". It should ONLY be called for the base assets`
      )
    }

    // Default account state doesn’t exist for delisted assets.
    // Return early in that case to avoid spamming the warning below.
    if (asset.baseAsset?.api?.features?.delisted) {
      return {}
    }

    const defaultAccountState = state.defaultAccountStates[asset.name]
    if (!defaultAccountState && !asset.isCombined) {
      console.warn(`No default account state found for asset "${asset.name}"`)
    }

    return defaultAccountState || {}
  },
})

export default helper
