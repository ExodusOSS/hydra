import { bitcoin } from './_fixtures.js'

test('toFixed()', function () {
  const b1 = bitcoin.BTC(1.123_456_5)
  expect(b1.toString()).toBe('1.1234565 BTC')
  expect(b1.toFixed(6).toString()).toBe('1.123457 BTC')

  const b2 = bitcoin.BTC(1.124_999_99)
  expect(b2.toString()).toBe('1.12499999 BTC')
  expect(b2.toFixed(2).toString()).toBe('1.12 BTC')

  const b3 = bitcoin.BTC(1.129)
  expect(b3.toString()).toBe('1.129 BTC')
  expect(b3.toFixed(2, 'floor').toString()).toBe('1.12 BTC')

  const b4 = bitcoin.BTC(1.121)
  expect(b4.toString()).toBe('1.121 BTC')
  expect(b4.toFixed(2, 'ceil').toString()).toBe('1.13 BTC')
})
