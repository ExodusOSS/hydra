import test from '../../__tests__/_test.js'
import Address from '../index.js'

test('should create an immutable address object', function (t) {
  const address = '12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT'
  const path = 'm/0/0' // (RELATIVE FROM ACCOUNT)

  const a = Address.create(address, { path })
  t.is(a.address, address, 'address is set')

  t.same(a.meta, { path }, 'meta is set')

  t.throws(
    () => {
      // @ts-expect-error -- testing immutability
      a.address = 'afa'
    },
    /Cannot assign to read only property/,
    'Address is immutable'
  )

  t.is(a.toString(), address, 'toString() is address')

  const meta = { path }
  t.same(a.toJSON(), { address, meta }, 'toJSON()')
  t.same(Address.fromJSON({ address, meta }), a, 'fromJSON()')
  t.same(a.pathArray, [0, 0], 'pathArray')

  t.end()
})

test('isAddress should return boolean', (t) => {
  t.true(Address.isAddress(Address.create('some-address')), 'isAddress() => true')
  t.false(Address.isAddress('some-address'), 'isAddress() => false')

  t.end()
})

test('pathArray', (t) => {
  const receive = Address.create('some-address', { path: 'm/0/0' })
  t.same(receive.pathArray, [0, 0])
  const receive10 = Address.create('some-address', { path: 'm/0/10' })
  t.same(receive10.pathArray, [0, 10])

  const change = Address.create('some-address', { path: 'm/1/0' })
  t.same(change.pathArray, [1, 0])
  const change10 = Address.create('some-address', { path: 'm/1/10' })
  t.same(change10.pathArray, [1, 10])

  const hardened = Address.create('some-address', { path: `m/0'/0` })
  t.same(hardened.pathArray, [0x80_00_00_00, 0])

  t.end()
})
