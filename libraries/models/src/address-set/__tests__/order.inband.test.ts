import test from '../../__tests__/_test.js'
import Address from '../../address/index.js'
import AddressSet from '../index.js'

test('should preserve order', (t) => {
  t.plan(6)

  const ac1 = AddressSet.fromArray([
    Address.create('some address 1'),
    Address.create('some address 2'),
    Address.create('some address 3'),
  ])

  const addrs = []
  for (const a of ac1) {
    addrs.push(String(a))
  }

  t.is(addrs[0], 'some address 1', 'has 1')
  t.is(addrs[1], 'some address 2', 'has 2')
  t.is(addrs[2], 'some address 3', 'has 3')

  const ac2 = new AddressSet()
    .add(Address.create('some address 3'))
    .add(Address.create('some address 1'))
    .add(Address.create('some address 2'))

  const addrs2 = []
  for (const a of ac2) {
    addrs2.push(String(a))
  }

  t.is(addrs2[0], 'some address 3', 'has 3')
  t.is(addrs2[1], 'some address 1', 'has 1')
  t.is(addrs2[2], 'some address 2', 'has 2')

  t.end()
})
