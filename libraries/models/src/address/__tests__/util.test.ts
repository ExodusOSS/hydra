import test from '../../__tests__/_test.js'
import Address from '../index.js'

test('should create an immutable address object', function (t) {
  const receive = Address.create('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT', { path: 'm/0/0' })
  t.true(Address.util.isReceiveAddress(receive))
  t.false(Address.util.isChangeAddress(receive))
  t.false(Address.util.isExchangeAddress(receive))

  const change = Address.create('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT', { path: 'm/1/0' })
  t.false(Address.util.isReceiveAddress(change))
  t.true(Address.util.isChangeAddress(change))
  t.false(Address.util.isExchangeAddress(change))

  const exchange = Address.create('12sLcvm1KXK5zBmXsAcYrUsqrRcrsuvaUT', { path: 'm/2/0' })
  t.false(Address.util.isReceiveAddress(exchange))
  t.false(Address.util.isChangeAddress(exchange))
  t.true(Address.util.isExchangeAddress(exchange))

  t.end()
})
