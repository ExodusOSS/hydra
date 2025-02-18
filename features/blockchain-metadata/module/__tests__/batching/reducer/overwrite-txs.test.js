import { asset } from '@exodus/bitcoin-meta'
import { TxSet } from '@exodus/models'
import { when } from 'jest-when'
import lodash from 'lodash'

import overwriteTxsReducer from '../../../batching/reducer/overwrite-txs.js'

const { get, has } = lodash

asset.feeAsset = asset
asset.baseAsset = asset
const getAssets = () => ({ [asset.name]: asset })
const currencies = { bitcoin: asset.currency }

describe('overwriteTxsReducer', () => {
  it('should replace changes', () => {
    const txs = [{ txId: 'previous-tx-1', date: new Date(), currencies }]
    const changes = {
      txLogs: {
        exodus_0: {
          bitcoin: TxSet.fromArray(txs),
        },
      },
    }
    const payload = {
      walletAccount: 'exodus_0',
      assetName: 'bitcoin',
      txs,
    }

    const result = overwriteTxsReducer(
      changes,
      { payload },
      {
        getCachedTxLog: jest.fn(),
        getAssets,
      }
    )

    expect(get(result, ['txLogs', 'exodus_0', 'bitcoin']).toJSON()).toEqual(
      TxSet.fromArray(txs).toJSON()
    )
  })

  it('should unset changes if new tx-set is equal to cached', () => {
    const changes = {
      txLogs: {
        exodus_0: {
          bitcoin: TxSet.fromArray([{ txId: 'changed-tx', date: new Date(), currencies }]),
        },
      },
    }

    const txs = [{ txId: 'previous-tx-1', date: new Date(), currencies }]
    const payload = {
      walletAccount: 'exodus_0',
      assetName: 'bitcoin',
      txs,
    }

    const getCachedTxLog = jest.fn()
    when(getCachedTxLog)
      .calledWith({ walletAccount: 'exodus_0', assetName: 'bitcoin' })
      .mockReturnValue(TxSet.fromArray(txs))

    const result = overwriteTxsReducer(
      changes,
      { payload },
      {
        getCachedTxLog,
        getAssets,
      }
    )

    expect(has(result, ['txLogs', 'exodus_0', 'bitcoin'])).toBe(false)
  })

  it('should replace changes when updating confirmations', () => {
    const cachedTxs = [{ txId: 'previous-tx-1', date: new Date(), currencies, confirmations: 0 }]
    const txs = [{ txId: 'previous-tx-1', date: new Date(), currencies, confirmations: 1 }]
    const changes = {
      txLogs: {
        exodus_0: {
          bitcoin: TxSet.fromArray(txs),
        },
      },
    }

    const payload = {
      walletAccount: 'exodus_0',
      assetName: 'bitcoin',
      txs,
    }

    const getCachedTxLog = jest.fn()
    when(getCachedTxLog)
      .calledWith({ walletAccount: 'exodus_0', assetName: 'bitcoin' })
      .mockReturnValue(TxSet.fromArray(cachedTxs))

    const result = overwriteTxsReducer(
      changes,
      { payload },
      {
        getCachedTxLog,
        getAssets,
      }
    )

    expect(get(result, ['txLogs', 'exodus_0', 'bitcoin']).toJSON()).toEqual(
      TxSet.fromArray(txs).toJSON()
    )
  })
})
