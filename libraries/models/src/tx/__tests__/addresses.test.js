import lodash from 'lodash'
import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import Address from '../../address/index.js'
import { normalizeTxJSON } from '../utils.js'
import Tx from '../index.js'
import _tx from './fixtures/index.cjs'

const { tx: _txA } = _tx
const { cloneDeep: clone } = lodash

const txA = normalizeTxJSON({ json: _txA, asset: assets[_txA.coinName] })

test('should parse and create AddressSet ', (t) => {
  const tx1 = Tx.fromJSON(txA)
  const a = Address.fromJSON(txA.addresses[0])
  const b = Address.fromJSON(txA.addresses[1])

  t.true(tx1.addresses.has(a), 'has first addr')
  t.true(tx1.addresses.has(b), 'has second addr')

  t.is(tx1.toJSON().addresses.length, 2, 'two addresses')

  const tx2 = tx1.clone()

  t.true(tx2.addresses.has(a), 'has first addr')
  t.true(tx2.addresses.has(b), 'has second addr')

  t.end()
})

test('if no addresses, create EMPTY set', (t) => {
  const txB = clone(txA)
  delete txB.addresses

  const tx1 = Tx.fromJSON(txB)
  t.is(tx1.addresses.size, 0, 'empty addresses set')

  t.end()
})

test('if address has unknown type, throw an error', (t) => {
  const txC = clone(txA)
  txC.addresses = 'invalid'

  t.throws(() => Tx.fromJSON(txC), Error, 'should throw')

  t.end()
})
