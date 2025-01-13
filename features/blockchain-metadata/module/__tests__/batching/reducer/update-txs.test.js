import { omit } from '@exodus/basic-utils'
import { Tx, TxSet } from '@exodus/models'
import { asset } from '@exodus/bitcoin-meta'

import updateTxsReducer from '../../../batching/reducer/update-txs.js'

asset.feeAsset = asset
asset.baseAsset = asset
const getAssets = () => ({ [asset.name]: asset })
const currencies = { bitcoin: asset.currency }
const date = new Date(100_000)
const newDate = new Date(200_000)

describe('updateTxsReducer', () => {
  const getCachedTxLog = jest.fn()

  it('field gets updated even though it is not in the payload', () => {
    const currentTx = Tx.fromJSON({ txId: 'previous-tx-1', date, currencies })
    const currentTxs = TxSet.fromArray([currentTx])
    const currentState = { txLogs: { exodus_0: { bitcoin: currentTxs } } }

    // Simulate previous implementation by constructing a Tx from updated fields. Here tx.date
    // gets initialized to a default value:
    const updates = TxSet.fromArray([{ txId: 'previous-tx-1', currencies }])
    const payload = { walletAccount: 'exodus_0', assetName: 'bitcoin', txs: updates }

    const result = updateTxsReducer(currentState, { payload }, { getCachedTxLog, getAssets })
    const resultTx = result.txLogs.exodus_0.bitcoin.get('previous-tx-1')

    // We are not updating tx.date, so we expect it not to change
    expect(resultTx.date).not.toEqual(date)
    // There is no guarantee everything else will be the same because the test only uses default values:
    expect(omit(resultTx.toJSON(), ['date'])).toEqual(omit(currentTx.toJSON(), ['date']))
  })

  it('should replace changes with JSON payload', () => {
    const currentTx = Tx.fromJSON({ txId: 'previous-tx-1', date, currencies })
    const currentTxs = TxSet.fromArray([currentTx])
    const currentState = { txLogs: { exodus_0: { bitcoin: currentTxs } } }

    const updates = [{ txId: 'previous-tx-1', date: newDate }]
    const payload = { walletAccount: 'exodus_0', assetName: 'bitcoin', txs: updates }

    const result = updateTxsReducer(currentState, { payload }, { getCachedTxLog, getAssets })
    const resultTx = result.txLogs.exodus_0.bitcoin.get('previous-tx-1')

    expect(resultTx.date).toEqual(newDate)
    expect(omit(resultTx.toJSON(), ['date'])).toEqual(omit(currentTx.toJSON(), ['date']))
  })

  it('should replace changes with TxSet payload', () => {
    const currentTx = Tx.fromJSON({ txId: 'previous-tx-1', date, currencies })
    const currentTxs = TxSet.fromArray([currentTx])
    const currentState = { txLogs: { exodus_0: { bitcoin: currentTxs } } }

    const updates = TxSet.fromArray([{ txId: 'previous-tx-1', currencies, date: newDate }])
    const payload = { walletAccount: 'exodus_0', assetName: 'bitcoin', txs: updates }

    const result = updateTxsReducer(currentState, { payload }, { getCachedTxLog, getAssets })
    const resultTx = result.txLogs.exodus_0.bitcoin.get('previous-tx-1')

    expect(resultTx.date).toEqual(newDate)
    expect(omit(resultTx.toJSON(), ['date'])).toEqual(omit(currentTx.toJSON(), ['date']))
  })
})
