// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { set } from '@exodus/basic-utils'
import type { BatchingReducer, UpdateAccountStateParams } from '../../../types.js'

const { get, unset } = lodash

const updateAccountStateReducer: BatchingReducer<UpdateAccountStateParams> = (
  changes,
  action,
  { getAsset, getCachedAccountState }
) => {
  const { walletAccount, assetName, newData } = action.payload

  const cached =
    getCachedAccountState({ walletAccount, assetName }) ??
    getAsset(assetName).api.createAccountState!().create()

  const current = get(changes, ['accountStates', walletAccount, assetName]) ?? cached
  const newAccountState = current.merge(newData)

  if (newAccountState.equals(cached)) {
    unset(changes, ['accountStates', walletAccount, assetName])
    return changes
  }

  set(changes, ['accountStates', walletAccount, assetName], newAccountState)
  return changes
}

export default updateAccountStateReducer
