import { bitcoin } from '../_fixtures'

test('add() should return the addition', function() {
  expect(
    bitcoin
      .BTC(3)
      .add(bitcoin.BTC(2))
      .toString()
  ).toBe('5 BTC')

  expect(
    bitcoin
      .BTC(-3)
      .add(bitcoin.BTC(2))
      .toString()
  ).toBe('-1 BTC')

  expect(
    bitcoin
      .BTC(3)
      .add(bitcoin.BTC(-2))
      .toString()
  ).toBe('1 BTC')

  expect(
    bitcoin
      .BTC(-3)
      .add(bitcoin.BTC(-2))
      .toString()
  ).toBe('-5 BTC')

  expect(
    bitcoin
      .BTC(1.5)
      .add(bitcoin.BTC(2))
      .toString()
  ).toBe('3.5 BTC')

  expect(
    bitcoin
      .BTC(0.1)
      .add(bitcoin.satoshis(2))
      .toString()
  ).toBe('0.10000002 BTC')
})

test('add() should coerce to NumberUnit', function() {
  expect(
    bitcoin
      .BTC(3)
      .add(2)
      .toString()
  ).toBe('5 BTC')

  expect(
    bitcoin
      .BTC(3)
      .add(-2)
      .toString()
  ).toBe('1 BTC')

  expect(
    bitcoin
      .BTC(-3)
      .add('-2.5')
      .toString()
  ).toBe('-5.5 BTC')

  expect(
    bitcoin
      .BTC(1)
      .toBase()
      .add(1)
      .toString()
  ).toBe('100000001 satoshis')
})
