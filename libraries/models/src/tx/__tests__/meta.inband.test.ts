import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../index.js'
import { normalizeTxJSON } from '../utils.js'
import { tx as _txFixture } from './fixtures/index.js'

const txFixture = normalizeTxJSON({ json: _txFixture, asset: assets[_txFixture.coinName] })

test('should serialize / deserialize meta', (t) => {
  const tx1 = Tx.fromJSON(txFixture)
  t.same(tx1.meta, Object.create(null), 'meta is init to an empty object')

  // set meta
  const tx2 = tx1.update({
    meta: {
      shapeshiftOrderId: 'some order',
      shapeshiftDeposit: 'some deposit address',
    },
  })
  t.is(tx2.meta.shapeshiftOrderId, 'some order', 'meta field set')
  t.is(tx2.meta.shapeshiftDeposit, 'some deposit address', 'meta field set')

  const txJSON = tx2.toJSON()
  t.is(txJSON.meta.shapeshiftOrderId, 'some order', 'meta field set')
  t.is(txJSON.meta.shapeshiftDeposit, 'some deposit address', 'meta field set')

  const tx3 = Tx.fromJSON(txJSON)
  t.is(tx3.meta.shapeshiftOrderId, 'some order', 'meta field set')
  t.is(tx3.meta.shapeshiftDeposit, 'some deposit address', 'meta field set')

  t.end()
})

test('newly constructed Tx should have meta', (t) => {
  const tx = Tx.fromJSON({ currencies: { bitcoin: { BTC: 8, satoshis: 0 } } })
  t.same(tx.meta, Object.create(null), 'empty object')

  t.end()
})
