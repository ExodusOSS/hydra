import { bitcoin, ethereum } from '../_fixtures.js'

test('unit mismatch throws', function () {
  expect(() => bitcoin.BTC(3).equals(ethereum.ETH(3)).toString()).toThrow(
    /different NumberUnit types/
  )
})
