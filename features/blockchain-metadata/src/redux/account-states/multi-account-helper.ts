import { memoize } from '@exodus/basic-utils'
import { createReduxModuleHelper } from '@exodus/multi-account-redux'
import id from './id.js'
import type { SliceState } from '@exodus/multi-account-redux'
import type { ApiFeatures } from '@exodus/asset-types'
import type { AccountStateData, AccountStatesReduxState, Asset } from '../../types.js'

const getDefaultAccountStates = (state: SliceState) =>
  // allow: upstream SliceState cannot express this slice's extra defaultAccountStates key
  (state as AccountStatesReduxState).defaultAccountStates

const helper = createReduxModuleHelper<AccountStateData, Asset>({
  slice: id,
  createInitialPerAssetData: memoize(
    ({ state, asset }: { state: SliceState; asset: Asset }): AccountStateData => {
      // TODO: check `asset.api.features.accountState` instead, when `asset.api.features` becomes available
      if (asset.name !== asset.baseAsset.name) {
        console.warn(
          `createInitialPerAssetData was called for token "${asset.name}". It should ONLY be called for the base assets`
        )
      }

      // Default account state doesn’t exist for delisted assets.
      // Return early in that case to avoid spamming the warning below.
      // `delisted` is a real runtime feature flag (cf. libraries/trezor-meta
      // compatibility-utils) that @exodus/asset-types' ApiFeatures doesn't
      // declare yet; the annotated local keeps the read typed without a cast.
      const features: (ApiFeatures & { delisted?: boolean }) | undefined =
        asset.baseAsset?.api?.features
      if (features?.delisted) {
        return {}
      }

      const defaultAccountState = getDefaultAccountStates(state)[asset.name]
      if (!defaultAccountState && !asset.isCombined) {
        console.warn(`No default account state found for asset "${asset.name}"`)
      }

      return defaultAccountState || {}
    },
    ({ state, asset }: { state: SliceState; asset: Asset }) =>
      `${getDefaultAccountStates(state)[asset.name] ? 'withDefaultAccountState' : 'withoutDefaultAccountState'}:${asset.name}`
  ),
})

export default helper
