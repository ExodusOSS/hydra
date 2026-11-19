import test from '../../__tests__/_test.js'
import assets from '../../__tests__/assets.js'
import UtxoCollection from '../index.js'

test('> when empty should create empty collection', function (t) {
  t.plan(4)

  const col = UtxoCollection.createEmpty({ currency: assets.bitcoin.currency })
  t.is(col.size, 0, '0 size')
  t.is(col.value.toDefaultNumber(), 0, '0 value')
  t.same(col.toArray(), [], 'empty array')
  t.is(col.empty, true, 'empty is true')

  t.end()
})
