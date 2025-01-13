import { strict as assert } from 'assert'
import { bitcoin } from './_fixtures'

test('ceil()', function() {
  const b1 = bitcoin.BTC(1)
  assert.equal(b1.toString(), '1 BTC')
  assert.equal(b1.ceil().toString(), '1 BTC')

  const b2 = bitcoin.BTC(1.49)
  assert.equal(b2.toString(), '1.49 BTC')
  assert.equal(b2.ceil().toString(), '2 BTC')

  const b3 = bitcoin.BTC(1.5)
  assert.equal(b3.toString(), '1.5 BTC')
  assert.equal(b3.ceil().toString(), '2 BTC')
})
