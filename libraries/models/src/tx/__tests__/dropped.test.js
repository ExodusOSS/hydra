import test from '../../../_test.js'
import Tx from '../index.js'

test('fromJSON() / toJSON() should handle dropped without confirmations defined', (t) => {
  const tx = Tx.fromJSON({
    txId: 'deadbeef',
    dropped: true,
    date: new Date(),
    currencies: { foo: { base: 0 } },
  })
  t.true(tx.dropped, 'dropped is set')

  const txObj = tx.toJSON()
  t.true(txObj.dropped, 'dropped is set on obj')

  t.end()
})

test('fromJSON() / toJSON() should handle dropped with confirmations 0', (t) => {
  const tx = Tx.fromJSON({
    txId: 'deadbeef',
    dropped: true,
    confirmations: 0,
    date: new Date(),
    currencies: { foo: { base: 0 } },
  })
  t.true(tx.dropped, 'dropped is set')

  const txObj = tx.toJSON()
  t.true(txObj.dropped, 'dropped is set on obj')

  t.end()
})

test('confirmation should unset dropped', (t) => {
  const tx = Tx.fromJSON({
    txId: 'deadbeef',
    dropped: true,
    confirmations: 1,
    date: new Date(),
    currencies: { foo: { base: 0 } },
  })
  t.false(tx.dropped, 'dropped is not set')

  const txObj = tx.toJSON()
  t.false(txObj.dropped, 'dropped is not set on obj')

  t.end()
})
