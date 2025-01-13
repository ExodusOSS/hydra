import { strict as assert } from 'assert'
import { bitcoin } from './_fixtures'

test('valueOf() should return primitive value', function() {
  let b1 = bitcoin.BTC(1)
  let b2 = bitcoin.BTC(2)
  let b3 = bitcoin.satoshis(10000)

  let gt21 = b2 > b1
  let gt12 = b1 > b2
  assert(gt21, '2 > 1')
  assert(!gt12, '1 < 2')

  assert.equal(b2 + b1, 3)
  assert.equal(b2 + 555, 557)
  assert.equal(b2 - b1, 1)

  assert(b3 < b2, '10,000 statoshis less than 2 BTC')
})
