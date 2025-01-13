import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'

test('> when value undefined/null, should throw', function (t) {
  t.plan(2)

  t.throws(() => UtxoCollection.fromJSON(null, { currency: assets.bitcoin.currency }))
  t.throws(() => UtxoCollection.fromJSON(undefined, { currency: assets.bitcoin.currency }))

  t.end()
})
