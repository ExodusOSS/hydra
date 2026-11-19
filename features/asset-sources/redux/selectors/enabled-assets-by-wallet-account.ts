import { memoize } from '@exodus/basic-utils'
import type { RootStateWithSlice, SelectorDefinition } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'

import type { AssetSourcesState } from '../index.js'

const EMPTY = new Set<string>()

type RootState = RootStateWithSlice<'assetSources', AssetSourcesState>

type AvailableAssetNamesByWalletAccountSelector = (state: RootState) => Record<string, Set<string>>
// `enabledAssets` is a cross-module dep imported from a JS module without a type;
// declaring it on RootState here would over-constrain consumers whose store can't
// statically prove the slice. Keep the own-slice requirement only.
type EnabledAssetsSelector = (state: RootState) => Record<string, boolean>

const selectorFactory = (
  availableAssetNamesByWalletAccountSelector: AvailableAssetNamesByWalletAccountSelector,
  enabledAssetsSelector: EnabledAssetsSelector
) =>
  memoize((walletAccount: string) =>
    createSelector(
      availableAssetNamesByWalletAccountSelector,
      enabledAssetsSelector,
      (availableAssetsByWalletAccount, enabledAssets): Set<string> => {
        const availableAssets = availableAssetsByWalletAccount[walletAccount]
        if (!availableAssets) return EMPTY

        return new Set([...availableAssets].filter((asset) => enabledAssets[asset]))
      }
    )
  )

const createEnabledAssetsByWalletAccountSelectorDefinition = {
  id: 'createEnabledAssetsByWalletAccount',
  selectorFactory,
  dependencies: [
    { selector: 'availableAssetNamesByWalletAccount' },
    { module: 'enabledAssets', selector: 'data' },
  ],
} as const satisfies SelectorDefinition

export default createEnabledAssetsByWalletAccountSelectorDefinition
