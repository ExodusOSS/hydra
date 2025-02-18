import { asset } from '@exodus/bitcoin-meta'
import { TxSet } from '@exodus/models'
import { when } from 'jest-when'
import lodash from 'lodash'

import clearTxsReducer from '../../../batching/reducer/clear-txs.js'

const { get, has } = lodash

const currencies = { bitcoin: asset.currency }

describe('clearTxsReducer', () => {
  it('should remove changes', () => {
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
    }

    const result = clearTxsReducer(
      changes,
      { payload },
      {
        getCachedTxLog: jest.fn(),
      }
    )

    expect(has(result, ['txLogs', 'exodus_0', 'bitcoin'])).toBe(false)
  })

  it('should set empty if cached tx-log with transactions present', () => {
    const changes = {
      txLogs: {},
    }

    const txs = [{ txId: 'previous-tx-1', date: new Date(), currencies }]
    const payload = {
      walletAccount: 'exodus_0',
      assetName: 'bitcoin',
    }

    const getCachedTxLog = jest.fn()
    when(getCachedTxLog)
      .calledWith({ walletAccount: 'exodus_0', assetName: 'bitcoin' })
      .mockReturnValue(TxSet.fromArray(txs))

    const result = clearTxsReducer(
      changes,
      { payload },
      {
        getCachedTxLog,
      }
    )

    expect(get(result, ['txLogs', 'exodus_0', 'bitcoin']).toJSON()).toEqual(TxSet.EMPTY.toJSON())
  })
})
