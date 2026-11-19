import { mapValues } from '@exodus/basic-utils'
import type { AssetName, ReduxWalletAssetState, WalletAccountName } from '../types.js'

type AssetSourceMap<Value> = Record<WalletAccountName, Record<AssetName, Value>>

type ReducerPayload<Value> = {
  value?: AssetSourceMap<Value>
  changes?: AssetSourceMap<Value>
}

const defaultReducer = <Value>(
  state: Record<WalletAccountName, ReduxWalletAssetState<Value>>,
  { value, changes }: ReducerPayload<Value>
): Record<WalletAccountName, ReduxWalletAssetState<Value>> =>
  value
    ? mapValues(value, (txSetsByAsset) => ({
        error: null,
        loaded: true,
        data: txSetsByAsset,
      }))
    : {
        ...state,
        ...mapValues(changes, (txSetsByAsset, walletAccount) => ({
          ...state[walletAccount],
          error: null,
          loaded: true,
          data: {
            ...state[walletAccount]?.data,
            ...txSetsByAsset,
          },
        })),
      }

export default defaultReducer
