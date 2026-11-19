import test from '../../__tests__/_test.js'
import Address from '../../address/index.js'
import AddressSet from '../index.js'

test('union', (t) => {
  const addr1 = Address.create('some-address-1')
  const addr2 = Address.create('some-address-2')

  // note different object reference, but same as addr1
  const addr3 = Address.create('some-address-1')
  const addr4 = Address.create('some-address-3')

  const as1 = AddressSet.fromArray([addr1, addr2])
  const as2 = AddressSet.fromArray([addr3, addr4])
  const as3 = as1.union(as2)

  t.is(as3.size, 3, 'has 3 unique addresses')

  t.true(as3.has(addr1), 'includes address 1')
  t.true(as3.has(addr2), 'has address 2')
  t.true(as3.has(addr3), 'has different object, but address 1')
  t.true(as3.has(addr4), 'has 4')

  t.end()
})
