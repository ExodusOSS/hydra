import test from '../../__tests__/_test.js'
import TxSet from '../index.js'

test('EMPTY', (t) => {
  const set = TxSet.EMPTY
  t.is(set.size, 0, 'size is 0')
  t.is(set.addresses.size, 0, 'address size is 0')

  t.end()
})
