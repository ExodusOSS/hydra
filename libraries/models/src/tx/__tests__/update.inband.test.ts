import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import Tx from '../index.js'
import { normalizeTxJSON } from '../utils.js'
import { tx as _txFixture } from './fixtures/index.js'

const txFixture = normalizeTxJSON({ json: _txFixture, asset: assets[_txFixture.coinName] })

test('update() should update fields of TX', (t) => {
  const tx1 = Tx.fromJSON(txFixture)
  t.true(tx1.coinAmount.equals(assets.bitcoin.currency.BTC('0.001')))
  t.is(tx1.confirmations, -1, 'confirmations set to 0')

  const tx2 = tx1.update({ coinAmount: '0.002 BTC' })
  t.true(
    tx2.coinAmount.equals(assets.bitcoin.currency.BTC('0.002')),
    '0.002 BTC number properly set'
  )

  const tx3 = tx2.update({
    coinAmount: assets.bitcoin.currency.BTC('0.003'),
    confirmations: 10,
  })
  t.true(
    tx3.coinAmount.equals(assets.bitcoin.currency.BTC('0.003')),
    '0.003 BTC number properly set'
  )
  t.is(tx3.confirmations, 10, 'confirmations updated to 10')

  const tx4 = tx3.update({
    data: {
      y: 20,
    },
  })

  t.same(tx4.data, { x: 10, y: 20 }, 'merges nested properties')
  t.same(tx3.data, { x: 10 }, 'does not mutate old TX')

  t.end()
})

test('update() accepts serialized TxJson (toJSON output)', (t) => {
  const tx1 = Tx.fromJSON(txFixture)
  const tx1Updated = tx1.update({ coinAmount: '0.002 BTC', confirmations: 5 })

  // Round-trip: pass another tx's toJSON output to update.
  const tx2 = tx1.update(tx1Updated.toJSON())
  t.true(tx2.equals(tx1Updated), 'tx.update(otherTx.toJSON()) reconstructs equivalent tx')

  // Self round-trip is a no-op (returns same instance).
  const tx3 = tx1.update(tx1.toJSON())
  t.is(tx3, tx1, 'tx.update(self.toJSON()) is a no-op (returns same instance)')

  t.end()
})
