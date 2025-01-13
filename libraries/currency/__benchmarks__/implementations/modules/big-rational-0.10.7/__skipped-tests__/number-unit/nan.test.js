import { bitcoin } from '../_fixtures'
import assert from 'assert'

test('should do something with NaN', () => {
  assert.throws(() => {
    bitcoin.BTC(NaN)
  })
})
