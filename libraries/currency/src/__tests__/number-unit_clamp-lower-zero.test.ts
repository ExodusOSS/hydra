import { bitcoin } from './_fixtures.js'

test('clamp at zero', function () {
  const b1 = bitcoin.BTC(1.53)
  const b2 = bitcoin.BTC(-1.53)

  const b10 = b1.clampLowerZero()
  const b20 = b2.clampLowerZero()

  expect(b10.toString()).toBe('1.53 BTC')
  expect(b20.toString()).toBe('0 BTC')
})
