import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import { normalizeTxJSON } from '../../tx/utils.js'
import _tx from '../../tx/__tests__/fixtures/index.cjs'
import TxSet from '../index.js'

const { tx: _tx1, tx2: _tx2 } = _tx

const tx1 = normalizeTxJSON({ json: _tx1, asset: assets[_tx1.coinName] })
const tx2 = normalizeTxJSON({ json: _tx2, asset: assets[_tx2.coinName] })

test('addresses should return AddressSet of all addresses (received)', (t) => {
  const txset = TxSet.fromArray([tx1, tx2])

  t.is(tx1.addresses.length, 2)
  t.is(tx2.addresses.length, 3) // duplicate

  t.is(txset.addresses.size, 4, 'has 4')

  t.end()
})
