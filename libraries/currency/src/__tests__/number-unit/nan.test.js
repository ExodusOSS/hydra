import assert from 'assert'

import { bitcoin } from '../_fixtures.js'

test('should do something with NaN', () => {
  assert.throws(() => {
    bitcoin.BTC(Number.NaN)
  })
})
