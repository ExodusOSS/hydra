import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import * as fixtures from './fixtures/index.cjs'

test('isEmpty()', function (t) {
  t.plan(4)

  const utxos1 = UtxoCollection.fromJSON(fixtures.fixture1, { currency: assets.bitcoin.currency })
  t.is(utxos1.isEmpty(), false, 'utxos empty')

  // create empty
  let col = UtxoCollection.createEmpty()
  t.is(col.isEmpty(), true, 'createEmpty() is empty')

  // empty array
  col = UtxoCollection.fromArray([])
  t.is(col.isEmpty(), true, 'fromArray empty')

  // null array
  col = UtxoCollection.fromArray(null)
  t.is(col.isEmpty(), true, 'fromArray null')

  // null data
  col = new UtxoCollection()
  t.is(col.isEmpty(), true, 'create produces empty')

  t.end()
})
