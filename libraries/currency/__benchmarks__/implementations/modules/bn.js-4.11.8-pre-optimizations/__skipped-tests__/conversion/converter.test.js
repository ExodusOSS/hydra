import assert from 'assert'
import * as currencies from '../_fixtures'
import rates from '../_rate_fixtures'
import conversion from '../../conversion'

const { bitcoin, ethereum } = currencies

test('conversion should convert amounts', function() {
  const convert = conversion(bitcoin.BTC(1), ethereum.ETH(10))

  const btc1 = bitcoin.BTC(2)
  const expected1 = ethereum.ETH(20)
  const actual1 = convert(btc1)
  assert.strictEqual(actual1.toString(), expected1.toString())

  const eth2 = ethereum.ETH(40)
  const expected2 = bitcoin.BTC(4)
  const actual2 = convert(eth2)
  assert.strictEqual(actual2.toString(), expected2.toString())

  const btc3 = bitcoin.satoshis(3 * 1e8)
  const expected3 = ethereum.ETH(30)
  const actual3 = convert(btc3)
  assert.strictEqual(actual3.toString(), expected3.toString())

  const eth4 = ethereum.finney(50 * 1e3)
  const expected4 = bitcoin.BTC(5)
  const actual4 = convert(eth4)
  assert.strictEqual(actual4.toString(), expected4.toString())
})

test('conversion matches rate fixtures', function() {
  rates.forEach(({ id, from, to, rate, conversion: expected }) => {
    const currency1 = currencies[from]
    const currency2 = currencies[to]

    const amount1 = currency1.defaultUnit(1)
    const amount2 = currency2.defaultUnit(1)

    const convert = conversion(amount1, currency2.defaultUnit(rate))

    const actualFromSide = convert(amount1).toString()
    const actualToSide = convert(amount2).toString()

    // we don't want them all print out as tests, too many, so we let assert throw and stop
    if (actualFromSide !== expected.fromSide) {
      assert.strictEqual(
        actualFromSide,
        expected.fromSide,
        `id ${id}: ${from}_${to} ${rate} - from side`
      )
    }

    if (actualToSide !== expected.toSide) {
      assert.strictEqual(actualToSide, expected.toSide, `id ${id}: ${from}_${to} ${rate} - to side`)
    }
  })

  // no assert throws, all matches
  assert.ok(true, 'matches')
})
