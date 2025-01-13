import lodash from 'lodash'
import { set } from '@exodus/basic-utils'

const { get, unset } = lodash

export default function updateAccountStateReducer(
  changes,
  action,
  { getAsset, getCachedAccountState }
) {
  const { walletAccount, assetName, newData } = action.payload

  const cached =
    getCachedAccountState({ walletAccount, assetName }) ??
    getAsset(assetName).api.createAccountState().create()

  const current = get(changes, ['accountStates', walletAccount, assetName]) ?? cached
  const newAccountState = current.merge(newData)

  if (newAccountState.equals(cached)) {
    unset(changes, ['accountStates', walletAccount, assetName])
    return changes
  }

  set(changes, ['accountStates', walletAccount, assetName], newAccountState)
  return changes
}
