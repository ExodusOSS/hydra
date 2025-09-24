import { strict as assert } from 'assert'

import { bitcoin, dollar } from './_fixtures.js'

test('UnitType toString()', function () {
  assert.equal(String(bitcoin), 'BTC')
  assert.equal(String(dollar), 'USD')
})
