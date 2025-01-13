import { bitcoin } from './_fixtures.js'
import { strict as assert } from 'assert'

test('floor()', function () {
  const b1 = bitcoin.BTC(1)
  assert.equal(b1.toString(), '1 BTC')
  assert.equal(b1.floor().toString(), '1 BTC')

  const b2 = bitcoin.BTC(1.49)
  assert.equal(b2.toString(), '1.49 BTC')
  assert.equal(b2.floor().toString(), '1 BTC')

  const b3 = bitcoin.BTC(1.5)
  assert.equal(b3.toString(), '1.5 BTC')
  assert.equal(b3.floor().toString(), '1 BTC')
})
