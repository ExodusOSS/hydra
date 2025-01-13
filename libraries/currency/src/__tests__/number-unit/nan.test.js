import { bitcoin } from '../_fixtures.js'
import assert from 'assert'

test('should do something with NaN', () => {
  assert.throws(() => {
    bitcoin.BTC(Number.NaN)
  })
})
