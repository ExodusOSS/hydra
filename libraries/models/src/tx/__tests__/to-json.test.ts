import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../index.js'
import { normalizeTxsJSON } from '../utils.js'
import { txs3 } from './fixtures/legacy/index.js'

const txs = normalizeTxsJSON({ json: txs3, assets })

test('toJSON() should produce feeAmount', (t) => {
  const tx1 = Tx.fromJSON(txs[0]!)
  const tx2 = Tx.fromJSON(tx1.toJSON())

  t.is(tx1.toJSON().feeAmount, '0.0002034 BTC', 'has fee amount')
  t.is(tx2.feeAmount.toString(), '0.0002034 BTC', 'has fee amount')
  t.true(tx1.equals(tx2), 'tx1 === tx2')

  t.end()
})

test('toJSON() should produce from', (t) => {
  const tx = Tx.fromJSON(txs[5]!)

  t.same(
    tx.toJSON().from,
    ['xrb_1jf76jbbmz8swncquc918gbe4csw8mx59kuayckg96d6wwepbjnnoq1pujci'],
    'has from'
  )

  t.end()
})

test('toJSON() should produce selfSend', (t) => {
  const tx = Tx.fromJSON(txs[6]!)

  t.same(tx.toJSON().selfSend, true, 'has selfSend')

  t.end()
})

test('toJSON() cleans up default fields', (t) => {
  const cleanJSON = {
    txId: 'txid',
    confirmations: -1,
    date: new Date().toISOString(),
    currencies: { foo: { base: 0 } },
    version: 1,
  } // bare minimum fields

  const tx = Tx.fromJSON(cleanJSON)
  const json = tx.toJSON()

  t.deepEqual(json, cleanJSON)
})
