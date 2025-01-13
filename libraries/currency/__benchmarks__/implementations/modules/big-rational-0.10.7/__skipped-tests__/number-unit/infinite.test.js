import { bitcoin } from '../_fixtures'
import assert from 'assert'

// NOTE: this WILL almost certainly change when we move
// to bn.js

test.skip('should do something with infinity', () => {
  const num = bitcoin.BTC(Infinity)
  assert.strictEqual(String(num), 'Infinity BTC')
})

test.skip('should do something with -infinity', () => {
  const num = bitcoin.BTC(-Infinity)
  assert.strictEqual(String(num), '-Infinity BTC')
})
