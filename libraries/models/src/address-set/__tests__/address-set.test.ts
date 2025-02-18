import test from '../../__tests__/_test.js'
import Address from '../../address/index.js'
import AddressSet from '../index.js'

test('create collection from array', (t) => {
  const ac = AddressSet.fromArray([])
  t.is(ac.size, 0)

  const ac2 = AddressSet.fromArray([
    Address.create('some address 1'),
    Address.create('some address 2'),
  ])
  t.is(ac2.size, 2)

  const ac3 = AddressSet.fromArray(['some-address-1', 'some-address-2'])

  t.true(Address.isAddress(ac3.get('some-address-1')), 'created from string, Address')

  t.end()
})

test('should add Address', (t) => {
  const addr = Address.create('some-address')
  const ac = AddressSet.fromArray([])
  const ac2 = ac.add(addr)
  t.is(ac.size, 0)
  t.is(ac2.size, 1)

  t.same(ac2.toArray(), [addr])

  t.end()
})

test('should remove an Address', (t) => {
  const addr = Address.create('some-address-1')
  const addr2 = Address.create('some-address-2')

  const ac = AddressSet.fromArray([addr, addr2])

  const ac1 = ac.remove(addr)
  t.same(ac1.toArray(), [addr2], 'remove by data')
  const ac2 = ac.remove('some-address-1')
  t.same(ac1, ac2, 'remove by string')

  const ac3 = ac.remove('we-dont-have-this')
  t.same(ac, ac3, 'returns same if not found')

  t.end()
})

test('get should return address', (t) => {
  const addr = Address.create('some-address-1')
  const addr2 = Address.create('some-address-2')
  const ac = AddressSet.fromArray([addr, addr2])

  t.same(ac.get(addr), addr)
  t.same(ac.get(addr2), addr2)

  t.same(ac.get('some-address-1'), addr)
  t.same(ac.get('some-address-2'), addr2)

  t.is(ac.get('dont have this'), undefined, 'when dont have, undef')

  t.end()
})

test('iterate with generator', (t) => {
  const addr1 = Address.create('some-address-1')
  const addr2 = Address.create('some-address-2')
  const ac = AddressSet.fromArray([addr1, addr2])

  const addrs = []
  for (const addr of ac) {
    addrs.push(addr)
  }

  t.same(ac.toArray(), addrs)

  t.end()
})

test('toAddressStrings() should return an array of address strings', (t) => {
  const addr1 = Address.create('some-address-1')
  const addr2 = Address.create('some-address-2')
  const ac = AddressSet.fromArray([addr1, addr2])

  t.same(ac.toAddressStrings(), ['some-address-1', 'some-address-2'])

  t.end()
})

test('EMPTY return an empty set', (t) => {
  const ac = AddressSet.EMPTY
  t.is(ac.size, 0, 'emtpy set has 0 size')

  t.end()
})

test('has', (t) => {
  const addr1 = Address.create('some-address-1')
  const addr2 = Address.create('some-address-2')

  // note different object reference, but same as addr1
  const addr3 = Address.create('some-address-1')

  const ac = AddressSet.fromArray([addr1, addr2])

  t.true(ac.has(addr1), 'includes address 1')
  t.true(ac.has(addr2), 'has address 2')
  t.true(ac.has(addr3), 'has different object, but address 1')

  t.end()
})
