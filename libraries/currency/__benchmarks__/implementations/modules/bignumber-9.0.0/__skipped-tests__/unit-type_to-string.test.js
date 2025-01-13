import { bitcoin, dollar } from './_fixtures'
import { strict as assert } from 'assert'

test('UnitType toString()', function() {
  assert.equal(String(bitcoin), 'BTC')
  assert.equal(String(dollar), 'USD')
})
