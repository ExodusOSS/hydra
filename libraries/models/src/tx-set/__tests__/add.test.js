import test from '../../../_test.js'
import assets from '../../__tests__/assets.js'
import Address from '../../address/index.js'
import Tx from '../../tx/index.js'
import { normalizeTxsJSON } from '../../tx/utils.js'
import _txs from '../../tx/__tests__/fixtures/legacy/index.cjs'
import TxSet from '../index.js'

const { txs1: _txs1 } = _txs

const txs1 = normalizeTxsJSON({ json: _txs1, assets })

test('add() should maintain order', (t) => {
  let txset = TxSet.fromArray(txs1)
  t.is(txset.size, 4, 'initial size')

  const tx0 = Tx.fromJSON({
    txId: 'DEADBEEF-1',
    date: '2009-01-09',
    currencies: { foo: { base: 0 } },
  })
  txset = txset.add(tx0)

  t.is(txset.size, 5, 'new size')
  t.is(txset.getAt(0), tx0, 'new tx 0')

  const txInf = Tx.fromJSON({
    txId: 'DEADBEEF-INF',
    date: '2030-01-09',
    currencies: { foo: { base: 0 } },
  })
  txset = txset.add(txInf)

  t.is(txset.size, 6, 'new size')
  t.is(txset.getAt(5), txInf, 'new tx last')

  const txMid = Tx.fromJSON({
    txId: 'DEADBEEF-MID',
    date: '2016-11-25',
    currencies: { foo: { base: 0 } },
  })
  txset = txset.add(txMid)

  t.is(txset.size, 7, 'new size')
  t.is(txset.getAt(2), txMid, 'new tx mid')

  t.end()
})

test('add() should replace TX if same TX ID exists', (t) => {
  let txset = TxSet.EMPTY

  const tx0 = Tx.fromJSON({
    txId: 'DEADBEEF-1',
    confirmations: 7,
    currencies: { foo: { base: 0 } },
  })
  txset = txset.add(tx0)
  t.is(txset.size, 1, 'size is 1 after adding')
  t.is(txset.get('DEADBEEF-1').confirmations, 7, 'confirmations set')

  const tx1 = Tx.fromJSON({
    txId: 'DEADBEEF-1', // SAME TXID AS tx0
    confirmations: 3,
    currencies: { foo: { base: 0 } },
  })
  txset = txset.add(tx1)
  t.is(txset.size, 1, 'size is 1 after adding')
  t.is(txset.get('DEADBEEF-1').confirmations, 3, 'confirmations set')

  t.end()
})

test('add() should not replace if date is older ', (t) => {
  let txset = TxSet.EMPTY

  const txOld = Tx.fromJSON({
    txId: 'DEADBEEF-1',
    confirmations: 5,
    date: 100,
    currencies: { foo: { base: 0 } },
  })

  const txNew = Tx.fromJSON({
    txId: 'DEADBEEF-1',
    confirmations: 7,
    date: 200,
    currencies: { foo: { base: 0 } },
  })

  txset = txset.add(txNew)
  t.is(txset.size, 1, 'size is 1 after adding')
  t.is(txset.get('DEADBEEF-1').confirmations, 7, 'confirmations set')
  t.is(txset.get('DEADBEEF-1').date.getTime(), 200, 'date set')

  txset = txset.add(txOld)
  t.is(txset.size, 1, 'size is 1 after adding')
  t.is(txset.get('DEADBEEF-1').confirmations, 7, 'confirmations set')
  t.is(txset.get('DEADBEEF-1').date.getTime(), 200, 'date set')

  t.end()
})

test('add() should replace if date is newer ', (t) => {
  let txset = TxSet.EMPTY

  const txOld = Tx.fromJSON({
    txId: 'DEADBEEF-1',
    confirmations: 5,
    date: 100,
    currencies: { foo: { base: 0 } },
  })

  const txNew = Tx.fromJSON({
    txId: 'DEADBEEF-1',
    confirmations: 7,
    date: 200,
    currencies: { foo: { base: 0 } },
  })

  txset = txset.add(txOld)
  t.is(txset.size, 1, 'size is 1 after adding')
  t.is(txset.get('DEADBEEF-1').confirmations, 5, 'confirmations set')
  t.is(txset.get('DEADBEEF-1').date.getTime(), 100, 'date set')

  txset = txset.add(txNew)
  t.is(txset.size, 1, 'size is 1 after adding')
  t.is(txset.get('DEADBEEF-1').confirmations, 7, 'confirmations set')
  t.is(txset.get('DEADBEEF-1').date.getTime(), 200, 'date set')

  t.end()
})

test('add() should maintain addresses', (t) => {
  const addr1 = Address.create('addr1')
  const tx1 = Tx.fromJSON({
    txId: 'DEADBEEF-1',
    addresses: [addr1],
    currencies: { foo: { base: 0 } },
  })

  const addr2 = Address.create('addr2')
  const tx2 = Tx.fromJSON({
    txId: 'DEADBEEF-2',
    addresses: [addr2],
    currencies: { foo: { base: 0 } },
  })

  let txset = TxSet.fromArray([tx1])
  t.true(txset.addresses.has(addr1), 'has addr1')

  txset = txset.add(tx2)
  t.true(txset.addresses.has(addr1), 'new set has addr1')
  t.true(txset.addresses.has(addr2), 'new set has addr2')

  t.end()
})
