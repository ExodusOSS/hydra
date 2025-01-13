import { bitcoin } from './_fixtures'
import { strict as assert } from 'assert'

test.skip('UnitType inspect()', function() {
  assert.equal({}.toString.call(bitcoin), '[UnitType (satoshis: 0),(bits: 2),(BTC: 8)]')
})
