import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import fixtures from './fixtures/index.cjs'

const { fixture1: fixture } = fixtures

test('should be able to iterate on collection', function (t) {
  const col = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })
  t.true(col.size > 0, 'has some elements')

  const arr = []
  for (const item of col) arr.push(item)
  const col2 = UtxoCollection.fromArray(arr, { currency: assets.bitcoin.currency })

  t.true(col.equals(col2), 'collections are equal')

  t.end()
})
