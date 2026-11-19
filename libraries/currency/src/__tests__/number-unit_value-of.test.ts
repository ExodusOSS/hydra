import { strict as assert } from 'assert'

import { bitcoin } from './_fixtures.js'

test('valueOf() should return primitive value', function () {
  const b1 = bitcoin.BTC(1)
  const b2 = bitcoin.BTC(2)
  const b3 = bitcoin.satoshis(10_000)

  // The test verifies that NumberUnit's `valueOf()` lets instances participate
  // in JS arithmetic coercion. `<` / `>` work via valueOf without TS help, but
  // `+` / `-` need explicit suppression because TS rejects `NumberUnit + NumberUnit`.

  const gt21 = b2 > b1
  const gt12 = b1 > b2
  assert(gt21, '2 > 1')
  assert(!gt12, '1 < 2')

  // @ts-expect-error -- valueOf coercion
  assert.equal(b2 + b1, 3)
  // @ts-expect-error -- valueOf coercion
  assert.equal(b2 + 555, 557)
  // @ts-expect-error -- valueOf coercion
  assert.equal(b2 - b1, 1)

  assert(b3 < b2, '10,000 statoshis less than 2 BTC')
})
