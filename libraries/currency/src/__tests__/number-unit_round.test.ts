import { strict as assert } from 'assert'

import { bitcoin } from './_fixtures.js'

test('round()', function () {
  const b1 = bitcoin.BTC(1)
  assert.equal(b1.toString(), '1 BTC')
  assert.equal(b1.round().toString(), '1 BTC')

  const b2 = bitcoin.BTC(1.49)
  assert.equal(b2.toString(), '1.49 BTC')
  assert.equal(b2.round().toString(), '1 BTC')

  const b3 = bitcoin.BTC(1.5)
  assert.equal(b3.toString(), '1.5 BTC')
  assert.equal(b3.round().toString(), '2 BTC')
})

test('round() with negative values', function () {
  const b1 = bitcoin.BTC(-1)
  assert.equal(b1.round().toDefaultString(), '-1')

  const b2 = bitcoin.BTC(-1.3)
  assert.equal(b2.round().toDefaultString(), '-1')

  const b3 = bitcoin.BTC(-1.5)
  assert.equal(b3.round().toDefaultString(), '-2')

  const b4 = bitcoin.BTC(-1.7)
  assert.equal(b4.round().toDefaultString(), '-2')
})

test('round() with negative values between -1 and 0', function () {
  const b1 = bitcoin.BTC(-0.3)
  assert.equal(b1.round().toDefaultString(), '0')

  const b2 = bitcoin.BTC(-0.49)
  assert.equal(b2.round().toDefaultString(), '0')

  const b3 = bitcoin.BTC(-0.5)
  assert.equal(b3.round().toDefaultString(), '-1')

  const b4 = bitcoin.BTC(-0.7)
  assert.equal(b4.round().toDefaultString(), '-1')
})
