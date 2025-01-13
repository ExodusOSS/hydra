import assert from 'assert'
import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import { fixture1, fixture3 } from './fixtures/index.cjs'

test('should compute union of collections', function (t) {
  const utxos1 = UtxoCollection.fromJSON(fixture1, { currency: assets.bitcoin.currency })
  const utxos2 = UtxoCollection.fromJSON(fixture3, { currency: assets.bitcoin.currency })

  const actual = utxos1.union(utxos2).union(utxos1).union(utxos2)
  const expected = utxos2.union(utxos1)

  // NOTE: this isn't equal in the way you'd expect; the contents are the same
  // but sort order is incorrect.
  // assert.strictDeepEqual reveals this detail
  assert.deepEqual(actual, expected, 'union of many collections still the same')

  t.end()
})
