import test from '../../../_test.js'
import AddressSet from '../index.js'
import Address from '../../address/index.js'

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

test('fromArray() should convert address-like objects to an Address', (t) => {
  const ac1o = {
    address: 'addr1',
    meta: { path: 'm/0/0' },
  }

  const ac2o = {
    address: 'addr2',
    meta: { path: 'm/1/0' },
  }

  const set = AddressSet.fromArray([ac1o, ac2o])

  const ac1 = set.get('addr1')
  const ac2 = set.get('addr2')
  t.true(ac1 instanceof Address, 'is address')
  t.true(ac2 instanceof Address, 'is address')

  t.deepEquals(ac1.toJSON(), ac1o, 'json address equal')
  t.deepEquals(ac2.toJSON(), ac2o, 'json address equal')

  t.end()
})
