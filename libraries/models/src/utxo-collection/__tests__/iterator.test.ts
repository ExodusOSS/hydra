import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'
import { fixture1 as fixture } from './fixtures/index.js'

test('should be able to iterate on collection', function (t) {
  const col = UtxoCollection.fromJSON(fixture, { currency: assets.bitcoin.currency })
  t.true(col.size > 0, 'has some elements')

  const arr = []
  for (const item of col) arr.push(item)
  const col2 = UtxoCollection.fromArray(arr, { currency: assets.bitcoin.currency })

  t.true(col.equals(col2), 'collections are equal')

  t.end()
})
