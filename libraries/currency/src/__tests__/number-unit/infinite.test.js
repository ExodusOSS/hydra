import { bitcoin } from '../_fixtures.js'
import assert from 'assert'

test('infinity not supported', () => {
  assert.throws(() => bitcoin.BTC(Number.POSITIVE_INFINITY), 'Infinity')
  assert.throws(() => bitcoin.BTC(Number.NEGATIVE_INFINITY), '-Infinity')
})
