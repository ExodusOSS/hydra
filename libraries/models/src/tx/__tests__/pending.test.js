import test from '../../../_test.js'
import Tx from '../index.js'

test('fromJSON() / toJSON() should handle dropped', (t) => {
  const tx = Tx.fromJSON({
    txId: 'deadbeef',
    dropped: true,
    date: new Date(),
    currencies: { foo: { base: 0 } },
  })
  t.is(tx.dropped, true, 'dropped is set')

  const txObj = tx.toJSON()
  t.is(txObj.dropped, true, 'dropped is set on obj')

  t.end()
})

test('dropped should not exist if not set', (t) => {
  const tx = Tx.fromJSON({
    txId: 'deadbeef',
    date: new Date(),
    currencies: { foo: { base: 0 } },
  })
  t.is(tx.dropped, undefined, 'dropped is not set')

  const txObj = tx.toJSON()
  t.is(txObj.dropped, undefined, 'dropped is set not set')

  t.end()
})

test('pending should ignore dropped', (t) => {
  const tx = Tx.fromJSON({
    txId: 'deadbeef',
    dropped: true,
    date: new Date(),
    currencies: { foo: { base: 0 } },
  })
  t.is(tx.pending, false, 'pending is false when dropped is set')

  const tx2 = Tx.fromJSON({
    txId: 'deadbeef',
    date: new Date(),
    currencies: { foo: { base: 0 } },
  })
  t.is(tx2.pending, true, 'pending is true when dropped is not set')

  t.end()
})
