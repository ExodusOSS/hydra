import { bitcoin } from './_fixtures.js'

test('toBase() should convert any unit to base unit', function () {
  const amtBTC = bitcoin.BTC(1.53)
  const amtBits = bitcoin.bits(1_530_000)
  const amtSat1 = amtBTC.toBase()
  const amtSat2 = amtBits.toBase()

  expect(amtSat1.unitName).toBe('satoshis')
  expect(amtSat2.unitName).toBe('satoshis')

  expect(amtSat1.toString()).toBe('153000000 satoshis')
  expect(amtSat2.toString()).toBe('153000000 satoshis')

  expect(amtBTC.equals(amtBits)).toBeTruthy()
  expect(amtSat1.equals(amtSat2)).toBeTruthy()
})

test('baseUnit() factory function', function () {
  const b1 = bitcoin.baseUnit('153000000')
  expect(b1.toString()).toBe('153000000 satoshis')

  const b2 = b1.toBase()
  expect(b2.toString()).toBe('153000000 satoshis')

  expect(b1.equals(b2)).toBeTruthy()
})
