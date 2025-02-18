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
