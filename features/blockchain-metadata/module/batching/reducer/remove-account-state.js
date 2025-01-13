import lodash from 'lodash'
import { set } from '@exodus/basic-utils'

const { unset } = lodash

export default function removeAccountStateReducer(
  changes,
  action,
  { getAsset, getCachedAccountState }
) {
  const { walletAccount, assetName } = action.payload

  const AccountState = getAsset(assetName).api.createAccountState()
  const emptyState = AccountState.create()
  const cached = getCachedAccountState({ walletAccount, assetName }) ?? emptyState

  if (emptyState.equals(cached)) {
    unset(changes, ['accountStates', walletAccount, assetName])
    return changes
  }

  set(changes, ['accountStates', walletAccount, assetName], emptyState)
  return changes
}
