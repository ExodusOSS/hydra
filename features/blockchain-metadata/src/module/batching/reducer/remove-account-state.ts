// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { set } from '@exodus/basic-utils'
import type { AssetSource, BatchingReducer } from '../../../types.js'

const { unset } = lodash

const removeAccountStateReducer: BatchingReducer<AssetSource> = (
  changes,
  action,
  { getAsset, getCachedAccountState }
) => {
  const { walletAccount, assetName } = action.payload

  const AccountState = getAsset(assetName).api.createAccountState!()
  const emptyState = AccountState.create()
  const cached = getCachedAccountState({ walletAccount, assetName }) ?? emptyState

  if (emptyState.equals(cached)) {
    unset(changes, ['accountStates', walletAccount, assetName])
    return changes
  }

  set(changes, ['accountStates', walletAccount, assetName], emptyState)
  return changes
}

export default removeAccountStateReducer
