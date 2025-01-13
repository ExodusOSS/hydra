import assert from 'assert'
import { ethereum } from '../_fixtures'

test('should convert to a JavaScript number', () => {
  const _num = 12134.078582082819
  const actual = ethereum.ETH(_num).toNumber()
  const expected = 12134.07858208282 // sucky (note difference)
  assert.strictEqual(actual, expected)
})
